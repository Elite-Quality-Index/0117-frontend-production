import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpIcon, Bot, Loader2, PaperclipIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useChat } from "@/hooks/use-chat"
import { Markdown } from "@/components/ui/markdown"
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
import { cn } from "@/lib/utils"

function ChatMessage({ message }: { message: { role: "user" | "assistant"; content: string } }) {
  const isUser = message.role === "user"

  return (
    <div className="px-3 py-4">
      <div
        className={cn(
          "mx-auto max-w-4xl space-y-2",
          isUser ? "flex flex-col items-end" : ""
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-muted">
              <Bot className="size-4" />
            </div>
            <p className="font-title text-3xl">EQx Chat</p>
          </div>
        )}
        <div
          className={cn(
            "overflow-hidden",
            isUser
              ? "w-fit max-w-[85%] rounded-lg rounded-tr-sm bg-primary/10 px-4 py-3"
              : "ml-9"
          )}
        >
          <Markdown className="prose prose-base max-w-none dark:prose-invert">
            {message.content}
          </Markdown>
        </div>
      </div>
    </div>
  )
}

function ChatMessageList({
  messages,
  isStreaming,
}: {
  messages: { role: "user" | "assistant"; content: string }[]
  isStreaming: boolean
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[832px]">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
          <div className="flex items-center gap-2 px-3 py-4">
            <div className="mx-auto max-w-4xl flex items-center gap-2 ml-9">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function ChatInput({
  onSend,
  disabled,
  centered = false,
}: {
  onSend: (content: string) => void
  disabled?: boolean
  centered?: boolean
}) {
  const [input, setInput] = useState("")
  const [responseMode, setResponseMode] = useState<"Normal" | "Concise" | "Comprehensive">("Normal")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setInput("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const inputContent = (
    <div className="space-y-1">
      <InputGroup>
        <InputGroupTextarea
          ref={textareaRef}
          placeholder="What is the Elite Quality Index?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="min-h-16 max-h-40 text-sm"
        />
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
          <InputGroupText className="ml-auto">powered by gpt-5.1</InputGroupText>
          <Separator orientation="vertical" className="!h-4" />
          <InputGroupButton
            variant="default"
            className="rounded-full transition-transform hover:scale-110"
            size="icon-xs"
            disabled={disabled || !input.trim()}
            onClick={handleSend}
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="text-xs text-muted-foreground px-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )

  if (centered) {
    return (
      <div className="w-full max-w-[832px]">
        {inputContent}
      </div>
    )
  }

  return (
    <div className="sticky bottom-0 border-t bg-background p-4">
      <div className="mx-auto max-w-[832px]">
        {inputContent}
      </div>
    </div>
  )
}

export function CloudChat() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const {
    messages,
    isStreaming,
    error,
    handleSendMessage,
    clearError,
  } = useChat()

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
      {error && (
        <div
          className="border-b border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive cursor-pointer"
          onClick={clearError}
        >
          {error} (click to dismiss)
        </div>
      )}

      {messages.length === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4">
          <div className="relative z-10 w-full max-w-4xl space-y-8">
            <div className="text-center">
              <h1 className="font-title text-5xl md:text-7xl text-foreground">
                <span className="underline decoration-2 underline-offset-8">The Elite Quality Index</span>
                <br />
                <span className="text-primary">cloud-chat</span>
              </h1>
            </div>
            <div className="flex justify-center">
              <ChatInput onSend={handleSendMessage} disabled={isStreaming} centered />
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatMessageList messages={messages} isStreaming={isStreaming} />
          <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
        </>
      )}
    </div>
  )
}
