import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PaperclipIcon, ArrowUpIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export function CloudChat() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [responseMode, setResponseMode] = useState<"Normal" | "Concise" | "Comprehensive">("Normal")

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login")
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-[832px] space-y-4">
          {/* Sample messages */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium shrink-0">
              AI
            </div>
            <div className="bg-muted/50 rounded-lg p-3 max-w-[70%]">
              <p className="text-sm">Hello! How can I help you today?</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[70%]">
              <p className="text-sm">I'd like to learn more about Cloud Chat.</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
              You
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium shrink-0">
              AI
            </div>
            <div className="bg-muted/50 rounded-lg p-3 max-w-[70%]">
              <p className="text-sm">
                Cloud Chat is your AI-powered assistant. You can ask questions,
                get help with tasks, and have natural conversations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Input area */}
      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="mx-auto max-w-[832px]">
          <InputGroup>
            <InputGroupTextarea placeholder="Ask, Search or Chat..." />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="ghost"
                className="hover:bg-transparent hover:text-primary"
                size="icon-xs"
              >
                <PaperclipIcon />
              </InputGroupButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<InputGroupButton variant="ghost">{responseMode}</InputGroupButton>}
                />
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="[--radius:0.95rem]"
                >
                  <DropdownMenuItem onSelect={() => setResponseMode("Normal")}>
                    Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setResponseMode("Concise")}>
                    Concise
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setResponseMode("Comprehensive")}>
                    Comprehensive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <InputGroupText className="ml-auto">52% used</InputGroupText>
              <Separator orientation="vertical" className="!h-4" />
              <InputGroupButton
                variant="default"
                className="rounded-full"
                size="icon-xs"
                disabled
              >
                <ArrowUpIcon />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </div>
  )
}
