interface GitHubTreeItem {
  path: string
  type: "file" | "dir"
  name: string
  sha: string
}

interface GitHubApiTreeResponse {
  tree: Array<{
    path: string
    type: "blob" | "tree"
    sha: string
  }>
}

// Simple in-memory cache with 5-minute expiration
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_DURATION,
  })
}

async function githubFetch(path: string) {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.REPO_OWNER || "Work-Local-Inc"
  const repo = process.env.REPO_NAME || "worklocal-knowledge"

  console.log("[v0] GitHub fetch attempt:", { path, owner, repo, hasToken: !!token })

  if (!token) {
    console.error("[v0] GITHUB_TOKEN environment variable is missing")
    throw new Error(
      "GITHUB_TOKEN environment variable is required. Please add your GitHub token to the environment variables in your deployment settings or .env.local file.",
    )
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/${path}`
  console.log("[v0] GitHub API URL:", url)

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Worklocal-Knowledge-Portal",
      },
      next: { revalidate: 300 }, // 5 minutes
    })

    console.log("[v0] GitHub API response:", { status: response.status, statusText: response.statusText })

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[v0] GitHub API returned 404 - resource not found")
        return null
      }
      console.error("[v0] GitHub API error:", response.status, response.statusText)
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] GitHub API success:", { dataType: typeof data, hasTree: !!data.tree })
    return data
  } catch (fetchError) {
    console.error("[v0] GitHub fetch error:", fetchError)
    throw fetchError
  }
}

export async function getRepoTree(): Promise<GitHubTreeItem[]> {
  console.log("[v0] getRepoTree called")
  const cacheKey = "repo-tree"
  const cached = getCached<GitHubTreeItem[]>(cacheKey)
  if (cached) {
    console.log("[v0] Returning cached repo tree:", cached.length, "items")
    return cached
  }

  try {
    const branch = process.env.REPO_BRANCH || "main"
    console.log("[v0] Fetching repo tree for branch:", branch)
    const data: GitHubApiTreeResponse = await githubFetch(`git/trees/${branch}?recursive=1`)

    if (!data) {
      console.log("[v0] No data returned from GitHub API")
      return []
    }

    const items: GitHubTreeItem[] = data.tree
      .filter((item) => item.type === "blob" && item.path.endsWith(".md"))
      .map((item) => ({
        path: item.path,
        type: "file" as const,
        name: item.path.split("/").pop() || item.path,
        sha: item.sha,
      }))
      .sort((a, b) => a.path.localeCompare(b.path))

    console.log("[v0] Processed repo tree:", items.length, "markdown files")
    setCache(cacheKey, items)
    return items
  } catch (error) {
    console.error("[v0] Error fetching repo tree:", error)
    if (error instanceof Error && error.message.includes("GITHUB_TOKEN")) {
      console.error("[v0] GitHub token error - please check environment variables")
    }
    return []
  }
}

export async function getFile(path: string): Promise<string | null> {
  const cacheKey = `file-${path}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached

  try {
    const data = await githubFetch(`contents/${path}`)

    if (!data || data.type !== "file") {
      return null
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8")
    setCache(cacheKey, content)
    return content
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error)
    return null
  }
}

export async function getGoldenList(): Promise<string[]> {
  const cacheKey = "golden-list"
  const cached = getCached<string[]>(cacheKey)
  if (cached) return cached

  try {
    // First try to get golden-manifest.json
    const manifest = await getFile("golden-manifest.json")
    if (manifest) {
      try {
        const parsed = JSON.parse(manifest)
        if (Array.isArray(parsed.files)) {
          setCache(cacheKey, parsed.files)
          return parsed.files
        }
      } catch (e) {
        console.warn("Invalid golden-manifest.json format")
      }
    }

    // Fallback: compute from front-matter
    const tree = await getRepoTree()
    const goldenFiles: string[] = []

    for (const item of tree) {
      if (item.type === "file" && item.name.endsWith(".md")) {
        const content = await getFile(item.path)
        if (content) {
          // Simple front-matter check for priority: golden
          const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
          if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1]
            if (frontMatter.includes("priority: golden") || frontMatter.includes('priority: "golden"')) {
              goldenFiles.push(item.path)
            }
          }
        }
      }
    }

    setCache(cacheKey, goldenFiles)
    return goldenFiles
  } catch (error) {
    console.error("Error getting golden list:", error)
    return []
  }
}

export async function getDirectoryContents(dirPath: string): Promise<GitHubTreeItem[]> {
  const cacheKey = `dir-${dirPath}`
  const cached = getCached<GitHubTreeItem[]>(cacheKey)
  if (cached) return cached

  try {
    const tree = await getRepoTree()

    // Normalize directory path (remove leading/trailing slashes)
    const normalizedDirPath = dirPath.replace(/^\/+|\/+$/g, "")

    // Get items in this directory
    const items: GitHubTreeItem[] = []
    const subdirs = new Set<string>()

    for (const item of tree) {
      if (item.type === "file" && item.path.endsWith(".md")) {
        // Check if file is in this directory
        if (normalizedDirPath === "") {
          // Root directory - only files with no slashes
          if (!item.path.includes("/")) {
            items.push(item)
          } else {
            // Add subdirectory
            const firstDir = item.path.split("/")[0]
            subdirs.add(firstDir)
          }
        } else {
          // Specific directory
          if (item.path.startsWith(normalizedDirPath + "/")) {
            const relativePath = item.path.substring(normalizedDirPath.length + 1)
            if (!relativePath.includes("/")) {
              // File directly in this directory
              items.push(item)
            } else {
              // File in subdirectory
              const firstDir = relativePath.split("/")[0]
              subdirs.add(firstDir)
            }
          }
        }
      }
    }

    // Add subdirectories as directory items
    for (const subdir of subdirs) {
      items.push({
        path: normalizedDirPath ? `${normalizedDirPath}/${subdir}` : subdir,
        type: "dir" as const,
        name: subdir,
        sha: "",
      })
    }

    // Sort: directories first, then files
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "dir" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    setCache(cacheKey, items)
    return items
  } catch (error) {
    console.error(`Error fetching directory contents for ${dirPath}:`, error)
    return []
  }
}
