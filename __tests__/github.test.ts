import { getRepoTree, getFile, getGoldenList } from "@/lib/github"
import jest from "jest"

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe("GitHub API functions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear cache
    jest.resetModules()
  })

  describe("getRepoTree", () => {
    it("should fetch and parse repository tree", async () => {
      const mockResponse = {
        tree: [
          { path: "doc1.md", type: "blob", sha: "abc123" },
          { path: "folder/doc2.md", type: "blob", sha: "def456" },
          { path: "README.txt", type: "blob", sha: "ghi789" }, // Should be filtered out
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await getRepoTree()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        path: "doc1.md",
        type: "file",
        name: "doc1.md",
        sha: "abc123",
      })
      expect(result[1]).toEqual({
        path: "folder/doc2.md",
        type: "file",
        name: "doc2.md",
        sha: "def456",
      })
    })

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response)

      const result = await getRepoTree()
      expect(result).toEqual([])
    })
  })

  describe("getFile", () => {
    it("should fetch and decode file content", async () => {
      const mockContent = Buffer.from("# Test Content").toString("base64")
      const mockResponse = {
        type: "file",
        content: mockContent,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await getFile("test.md")
      expect(result).toBe("# Test Content")
    })

    it("should return null for non-existent files", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      const result = await getFile("nonexistent.md")
      expect(result).toBeNull()
    })
  })

  describe("getGoldenList", () => {
    it("should use golden-manifest.json if available", async () => {
      const manifest = JSON.stringify({
        files: ["doc1.md", "doc2.md"],
      })
      const mockContent = Buffer.from(manifest).toString("base64")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: "file",
          content: mockContent,
        }),
      } as Response)

      const result = await getGoldenList()
      expect(result).toEqual(["doc1.md", "doc2.md"])
    })
  })
})
