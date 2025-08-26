import Link from "next/link"
import { File, Folder } from "lucide-react"

interface TreeItem {
  path: string
  type: "file" | "dir"
  name: string
}

interface TreeViewProps {
  items: TreeItem[]
}

export function TreeView({ items }: TreeViewProps) {
  // Group items by directory
  const grouped = items.reduce(
    (acc, item) => {
      const parts = item.path.split("/")
      const dir = parts.length > 1 ? parts[0] : "root"

      if (!acc[dir]) {
        acc[dir] = []
      }
      acc[dir].push(item)
      return acc
    },
    {} as Record<string, TreeItem[]>,
  )

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([dir, dirItems]) => (
        <div key={dir} className="space-y-1">
          <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
            <Folder className="w-4 h-4" />
            {dir}
          </div>
          <div className="ml-6 space-y-1">
            {dirItems.map((item) => (
              <Link
                key={item.path}
                href={`/browse/${item.path}`}
                className="flex items-center gap-2 text-sm hover:text-primary hover:bg-accent rounded px-2 py-1 transition-colors"
              >
                <File className="w-4 h-4" />
                {item.name.replace(".md", "")}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
