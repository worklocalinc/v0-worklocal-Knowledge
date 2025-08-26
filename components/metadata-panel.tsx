import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FrontMatter } from "@/lib/markdown"

interface MetadataPanelProps {
  frontMatter: FrontMatter
}

export function MetadataPanel({ frontMatter }: MetadataPanelProps) {
  const formatTags = (tags: string | string[] | undefined) => {
    if (!tags) return []
    if (typeof tags === "string") {
      return tags.split(/[,\s]+/).filter(Boolean)
    }
    return tags
  }

  const renderValue = (value: any): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const tags = formatTags(frontMatter.tags)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {frontMatter.title && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Title</h3>
            <p className="text-sm">{renderValue(frontMatter.title)}</p>
          </div>
        )}

        {frontMatter.category && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
            <Badge variant="secondary">{renderValue(frontMatter.category)}</Badge>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {renderValue(tag)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {frontMatter.owner && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Owner</h3>
            <p className="text-sm">{renderValue(frontMatter.owner)}</p>
          </div>
        )}

        {frontMatter.status && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
            <Badge variant={frontMatter.status === "published" ? "default" : "secondary"}>
              {renderValue(frontMatter.status)}
            </Badge>
          </div>
        )}

        {frontMatter.priority && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Priority</h3>
            <Badge
              variant={frontMatter.priority === "golden" ? "default" : "secondary"}
              className={frontMatter.priority === "golden" ? "bg-amber-500" : ""}
            >
              {renderValue(frontMatter.priority)}
            </Badge>
          </div>
        )}

        {frontMatter.lastUpdated && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Last Updated</h3>
            <p className="text-sm">{renderValue(frontMatter.lastUpdated)}</p>
          </div>
        )}

        {frontMatter.version && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Version</h3>
            <Badge variant="outline">{renderValue(frontMatter.version)}</Badge>
          </div>
        )}

        {frontMatter.confidentiality && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Confidentiality</h3>
            <Badge variant={frontMatter.confidentiality === "CONFIDENTIAL" ? "destructive" : "secondary"}>
              {renderValue(frontMatter.confidentiality)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
