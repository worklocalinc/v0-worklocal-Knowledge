import matter from "gray-matter"
import { remark } from "remark"
import remarkHtml from "remark-html"
import remarkGfm from "remark-gfm"

export interface FrontMatter {
  title?: string
  category?: string
  tags?: string | string[]
  lastUpdated?: string
  owner?: string
  status?: string
  priority?: string
  version?: string
  confidentiality?: string
  [key: string]: any
}

export interface ParsedMarkdown {
  content: string
  frontMatter: FrontMatter
}

export function parseMarkdown(markdownContent: string): ParsedMarkdown {
  try {
    const { data, content } = matter(markdownContent)

    return {
      content,
      frontMatter: data as FrontMatter,
    }
  } catch (error) {
    console.error("YAML frontmatter parsing error:", error)

    // Return the raw content without frontmatter parsing
    return {
      content: markdownContent,
      frontMatter: {
        title: "Error parsing frontmatter",
        status: "yaml-error",
      } as FrontMatter,
    }
  }
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content)

  return result.toString()
}
