import { Suspense } from "react"
import { getRepoTree, getGoldenList } from "@/lib/github"
import { TreeView } from "@/components/tree-view"
import { SearchBox } from "@/components/search-box"
import { GoldenToggle } from "@/components/golden-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function HomePage({
  searchParams,
}: {
  searchParams: { golden?: string; search?: string }
}) {
  console.log("[v0] HomePage rendering started")
  console.log("[v0] Environment check:", {
    hasToken: !!process.env.GITHUB_TOKEN,
    repoOwner: process.env.REPO_OWNER || "Work-Local-Inc",
    repoName: process.env.REPO_NAME || "worklocal-knowledge",
    repoBranch: process.env.REPO_BRANCH || "main",
  })

  const isGoldenFilter = searchParams.golden === "true"
  const searchQuery = searchParams.search || ""

  let tree: any[] = []
  let goldenFiles: string[] = []
  let error: string | null = null
  let isTokenError = false

  try {
    console.log("[v0] Starting GitHub API calls")
    const results = await Promise.all([getRepoTree(), isGoldenFilter ? getGoldenList() : Promise.resolve([])])
    tree = results[0]
    goldenFiles = results[1]
    console.log("[v0] GitHub API calls successful:", { treeCount: tree.length, goldenCount: goldenFiles.length })
  } catch (err) {
    console.error("[v0] Error loading data:", err)
    error = err instanceof Error ? err.message : "Failed to load repository data"
    isTokenError = err instanceof Error && err.message.includes("GITHUB_TOKEN")
    console.log("[v0] Error details:", { error, isTokenError })
  }

  const filteredTree = isGoldenFilter ? tree.filter((item) => goldenFiles.includes(item.path)) : tree

  const searchFilteredTree = searchQuery
    ? filteredTree.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.path.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredTree

  const totalDocs = tree.filter((item) => item.type === "file" && item.name.endsWith(".md")).length
  const goldenCount = goldenFiles.length

  console.log("[v0] HomePage rendering completed")
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Worklocal Knowledge Portal</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <GoldenToggle />
            <SearchBox />
            <div className="text-sm text-muted-foreground">
              {totalDocs} docs • {goldenCount} golden
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside className="w-80 border-r bg-card/50 min-h-screen p-4">
          <h2 className="font-semibold mb-4">Repository Tree</h2>
          <Suspense fallback={<div>Loading tree...</div>}>
            {error ? (
              isTokenError ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup Required</AlertTitle>
                  <AlertDescription className="mt-2 text-xs">
                    <div className="space-y-2">
                      <p>GitHub token needed to access repository.</p>
                      <div>
                        <strong>Setup steps:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Click gear icon (top right)</li>
                          <li>Go to Project Settings</li>
                          <li>
                            Add environment variables:
                            <ul className="list-disc list-inside ml-3 mt-1">
                              <li>
                                <code>GITHUB_TOKEN</code>
                              </li>
                              <li>
                                <code>REPO_OWNER</code>: Work-Local-Inc
                              </li>
                              <li>
                                <code>REPO_NAME</code>: worklocal-knowledge
                              </li>
                              <li>
                                <code>REPO_BRANCH</code>: main
                              </li>
                            </ul>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-red-600 text-sm p-4 bg-red-50 rounded-md">
                  <h3 className="font-semibold mb-2">Configuration Error</h3>
                  <p className="mb-2">{error}</p>
                  <p className="text-xs">
                    Please add your GITHUB_TOKEN to the environment variables in your deployment settings.
                  </p>
                </div>
              )
            ) : (
              <TreeView items={searchFilteredTree} />
            )}
          </Suspense>
        </aside>

        <main className="flex-1 p-8">
          <div className="text-center text-muted-foreground">
            <h2 className="text-xl font-semibold mb-2">Welcome to the Knowledge Portal</h2>
            {error ? (
              isTokenError ? (
                <div className="max-w-md mx-auto">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>GitHub Token Required</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="mb-3">
                        To access the Work-Local-Inc/worklocal-knowledge repository, you need to configure a GitHub
                        token.
                      </p>
                      <div className="text-left bg-muted p-3 rounded text-sm">
                        <strong>Create GitHub Token:</strong>
                        <br />
                        GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
                        <br />
                        Generate with <code>public_repo</code> scope
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-red-600">
                  <p>Unable to load repository data. Please check your GitHub token configuration.</p>
                </div>
              )
            ) : (
              <>
                <p>Select a file from the tree to view its content and metadata.</p>
                {isGoldenFilter && <p className="mt-2 text-amber-600">Showing only Golden priority files</p>}
                {searchQuery && <p className="mt-2">Searching for: "{searchQuery}"</p>}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
