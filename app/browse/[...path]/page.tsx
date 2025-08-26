import { notFound } from "next/navigation"
import { getFile, getDirectoryContents } from "@/lib/github"
import { parseMarkdown } from "@/lib/markdown"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { MetadataPanel } from "@/components/metadata-panel"
import { Breadcrumb } from "@/components/breadcrumb"
import { DirectoryListing } from "@/components/directory-listing"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CopyPathButton } from "@/components/copy-path-button"

interface PageProps {
  params: {
    path: string[]
  }
}

export default async function BrowsePage({ params }: PageProps) {
  const filePath = params.path.join("/")

  try {
    const fileContent = await getFile(filePath)

    if (fileContent) {
      // It's a file - render markdown
      const { content, frontMatter } = parseMarkdown(fileContent)

      const hasYamlError = frontMatter.status === "yaml-error"

      const githubUrl = `https://github.com/${process.env.REPO_OWNER || "Work-Local-Inc"}/${process.env.REPO_NAME || "worklocal-knowledge"}/blob/${process.env.REPO_BRANCH || "main"}/${filePath}`
      const rawUrl = `https://raw.githubusercontent.com/${process.env.REPO_OWNER || "Work-Local-Inc"}/${process.env.REPO_NAME || "worklocal-knowledge"}/${process.env.REPO_BRANCH || "main"}/${filePath}`

      return (
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card p-4">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb path={filePath} />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open on GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={rawUrl} target="_blank" rel="noopener noreferrer">
                    View Raw
                  </a>
                </Button>
                <CopyPathButton filePath={filePath} />
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto flex">
            <aside className="w-80 border-r bg-card/50 min-h-screen p-4">
              {hasYamlError && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>YAML Error</AlertTitle>
                  <AlertDescription className="text-xs">
                    The frontmatter in this file has invalid YAML syntax. The content is still displayed below.
                  </AlertDescription>
                </Alert>
              )}
              <MetadataPanel frontMatter={frontMatter} />
            </aside>

            <main className="flex-1 p-8">
              <MarkdownRenderer content={content} />
            </main>
          </div>
        </div>
      )
    } else {
      const directoryContents = await getDirectoryContents(filePath)

      if (directoryContents.length > 0 || filePath === "") {
        // It's a directory - show directory listing
        const githubUrl = `https://github.com/${process.env.REPO_OWNER || "Work-Local-Inc"}/${process.env.REPO_NAME || "worklocal-knowledge"}/tree/${process.env.REPO_BRANCH || "main"}/${filePath}`

        return (
          <div className="min-h-screen bg-background">
            <header className="border-b bg-card p-4">
              <div className="max-w-7xl mx-auto">
                <Breadcrumb path={filePath} />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open on GitHub
                    </a>
                  </Button>
                  <CopyPathButton filePath={filePath} />
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
              <DirectoryListing items={directoryContents} currentPath={filePath} />
            </main>
          </div>
        )
      } else {
        // Neither file nor directory found
        notFound()
      }
    }
  } catch (error) {
    console.error("Error loading file:", error)

    if (error instanceof Error && error.message.includes("GITHUB_TOKEN")) {
      return (
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-2xl mx-auto">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>GitHub Token Required</AlertTitle>
              <AlertDescription className="mt-2">
                To access the repository content, you need to set up a GitHub token in your environment variables.
              </AlertDescription>
            </Alert>

            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">Setup Instructions:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Click the <strong>gear icon</strong> in the top right of v0
                </li>
                <li>
                  Go to <strong>Project Settings</strong>
                </li>
                <li>
                  Add these environment variables:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>
                      <code>GITHUB_TOKEN</code> - Your GitHub personal access token
                    </li>
                    <li>
                      <code>REPO_OWNER</code> - Set to <code>Work-Local-Inc</code>
                    </li>
                    <li>
                      <code>REPO_NAME</code> - Set to <code>worklocal-knowledge</code>
                    </li>
                    <li>
                      <code>REPO_BRANCH</code> - Set to <code>main</code>
                    </li>
                  </ul>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-muted rounded text-sm">
                <strong>To create a GitHub token:</strong>
                <br />
                Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
                <br />
                Generate a new token with <code>public_repo</code> scope
              </div>
            </div>
          </div>
        </div>
      )
    }

    notFound()
  }
}
