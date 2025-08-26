import Link from "next/link"
import { Folder, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DirectoryItem {
  path: string
  type: "file" | "dir"
  name: string
}

interface DirectoryListingProps {
  items: DirectoryItem[]
  currentPath: string
}

export function DirectoryListing({ items, currentPath }: DirectoryListingProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>This directory is empty or contains no Markdown files.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-6">Directory: /{currentPath || "root"}</h2>

      <div className="grid gap-2">
        {items.map((item) => (
          <Card key={item.path} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <Link
                href={`/browse/${item.path}`}
                className="flex items-center gap-3 text-foreground hover:text-primary"
              >
                {item.type === "dir" ? (
                  <Folder className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-green-500" />
                )}
                <span className="font-medium">{item.name}</span>
                {item.type === "dir" && <span className="text-sm text-muted-foreground ml-auto">Directory</span>}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
