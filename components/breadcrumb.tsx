import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
  path: string
}

export function Breadcrumb({ path }: BreadcrumbProps) {
  const segments = path.split("/")
  const breadcrumbs = segments.map((segment, index) => ({
    name: segment,
    path: segments.slice(0, index + 1).join("/"),
  }))

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.name.replace(".md", "")}</span>
          ) : (
            <Link href={`/browse/${crumb.path}`} className="hover:text-foreground">
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
