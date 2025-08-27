"use client"

import { useState, useMemo } from "react"
import { Search, Copy, Eye, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import promptsData from "../data.json"

interface Prompt {
  id: string
  heading: string
  content: string
}

export default function PromptManagementSystem() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [copiedPrompts, setCopiedPrompts] = useState<Set<string>>(new Set())

  const filteredPrompts = useMemo(() => {
    return promptsData.prompts.filter((prompt: Prompt) =>
      prompt.heading.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const copyToClipboard = async (content: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedPrompts((prev) => new Set(prev).add(promptId))
      // Reset the feedback after 2 seconds
      setTimeout(() => {
        setCopiedPrompts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(promptId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const truncateContent = (content: string, maxLength = 120) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4 text-balance">Prompt Management System</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Organize, search, and manage your AI prompts with ease
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search prompts by heading..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-card border-border focus:ring-2 focus:ring-primary transition-all duration-200"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">
            {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt: Prompt) => (
            <Card
              key={prompt.id}
              className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 bg-card border-border"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-gradient transition-colors duration-200">
                  {prompt.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {truncateContent(prompt.content)}
                </CardDescription>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrompt(prompt)}
                    className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    See Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(prompt.content, prompt.id)}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      copiedPrompts.has(prompt.id)
                        ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                        : "gradient-primary hover:gradient-hover text-white border-none"
                    }`}
                  >
                    {copiedPrompts.has(prompt.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Copied!</span>
                      </>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or browse all available prompts</p>
          </div>
        )}

        <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gradient mb-2 pr-8">
                {selectedPrompt?.heading}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <DialogDescription className="text-card-foreground leading-relaxed text-base whitespace-pre-wrap">
                {selectedPrompt?.content}
              </DialogDescription>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() =>
                    selectedPrompt && copyToClipboard(selectedPrompt.content, `modal-${selectedPrompt.id}`)
                  }
                  className={`transition-all duration-300 ${
                    copiedPrompts.has(`modal-${selectedPrompt?.id}`)
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "gradient-primary hover:gradient-hover text-white border-none"
                  }`}
                >
                  {copiedPrompts.has(`modal-${selectedPrompt?.id}`) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Prompt Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSelectedPrompt(null)} className="hover:bg-secondary">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
