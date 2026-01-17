export function CloudChat() {
  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sample messages */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">AI</div>
          <div className="bg-muted/50 rounded-lg p-3 max-w-[70%]">
            <p className="text-sm">Hello! How can I help you today?</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[70%]">
            <p className="text-sm">I'd like to learn more about Cloud Chat.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">You</div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">AI</div>
          <div className="bg-muted/50 rounded-lg p-3 max-w-[70%]">
            <p className="text-sm">Cloud Chat is your AI-powered assistant. You can ask questions, get help with tasks, and have natural conversations.</p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
