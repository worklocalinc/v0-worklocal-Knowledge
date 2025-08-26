"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface CopyPathButtonProps {
  filePath: string
}

export function CopyPathButton({ filePath }: CopyPathButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(filePath)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="w-4 h-4 mr-2" />
      Copy Path
    </Button>
  )
}
