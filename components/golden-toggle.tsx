"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export function GoldenToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isGolden = searchParams.get("golden") === "true"

  const toggleGolden = () => {
    const params = new URLSearchParams(searchParams)
    if (isGolden) {
      params.delete("golden")
    } else {
      params.set("golden", "true")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <Button
      variant={isGolden ? "default" : "outline"}
      size="sm"
      onClick={toggleGolden}
      className={isGolden ? "bg-amber-500 hover:bg-amber-600" : ""}
    >
      <Star className={`w-4 h-4 mr-2 ${isGolden ? "fill-current" : ""}`} />
      Golden
    </Button>
  )
}
