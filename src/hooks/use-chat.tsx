import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"
import { useAuth } from "./use-auth"
import {
  fetchSessions,
  fetchSession,
  deleteSession,
  streamChat,
  type Session,
  type Message,
} from "@/lib/api"

// Key used for new/unsaved sessions
const NEW_SESSION_KEY = "__new__"

// Per-session state
interface SessionState {
  messages: Message[]
  isStreaming: boolean
}

interface ChatContextType {
  sessions: Session[]
  sessionsLoading: boolean
  currentSessionId: string | null
  messages: Message[]
  isStreaming: boolean
  error: string | null
  loadSessions: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  handleNewSession: () => void
  handleSelectSession: (sessionId: string) => void
  handleDeleteSession: (sessionId: string) => Promise<void>
  handleSendMessage: (content: string) => Promise<void>
  clearCurrentSession: () => void
  clearError: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, getIdToken } = useAuth()

  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Per-session state: Map from sessionId (or NEW_SESSION_KEY) to SessionState
  const [sessionStates, setSessionStates] = useState<Map<string, SessionState>>(
    () => new Map()
  )

  // Helper to get the storage key for a session
  const getSessionKey = useCallback((sessionId: string | null): string => {
    return sessionId ?? NEW_SESSION_KEY
  }, [])

  // Helper to get state for a specific session
  const getSessionState = useCallback(
    (sessionId: string | null): SessionState => {
      const key = getSessionKey(sessionId)
      return sessionStates.get(key) ?? { messages: [], isStreaming: false }
    },
    [sessionStates, getSessionKey]
  )

  // Helper to update state for a specific session
  const updateSessionState = useCallback(
    (
      sessionId: string | null,
      updater: (prev: SessionState) => SessionState
    ) => {
      const key = getSessionKey(sessionId)
      setSessionStates((prev) => {
        const newMap = new Map(prev)
        const currentState = prev.get(key) ?? { messages: [], isStreaming: false }
        newMap.set(key, updater(currentState))
        return newMap
      })
    },
    [getSessionKey]
  )

  // Derive current session's messages and streaming state
  const currentState = useMemo(
    () => getSessionState(currentSessionId),
    [getSessionState, currentSessionId]
  )
  const messages = currentState.messages
  const isStreaming = currentState.isStreaming

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return
      const data = await fetchSessions(token)
      setSessions(data)
    } catch (err) {
      console.error("Failed to load sessions:", err)
    } finally {
      setSessionsLoading(false)
    }
  }, [getIdToken])

  const loadSession = useCallback(
    async (sessionId: string) => {
      // Check if this session is currently streaming - don't overwrite local state
      const existingState = sessionStates.get(sessionId)
      if (existingState?.isStreaming) {
        // Just switch to viewing it, don't reload
        setCurrentSessionId(sessionId)
        return
      }

      try {
        const token = await getIdToken()
        if (!token) return
        const data = await fetchSession(token, sessionId)

        // Update the session's state with fetched messages
        setSessionStates((prev) => {
          const newMap = new Map(prev)
          newMap.set(sessionId, {
            messages: data.messages,
            isStreaming: false,
          })
          return newMap
        })
        setCurrentSessionId(sessionId)
      } catch (err) {
        console.error("Failed to load session:", err)
        setError("Failed to load conversation")
      }
    },
    [getIdToken, sessionStates]
  )

  // Reset all state when user logs out
  useEffect(() => {
    if (user) {
      loadSessions()
    } else {
      setSessions([])
      setCurrentSessionId(null)
      setSessionStates(new Map())
    }
  }, [user, loadSessions])

  const handleNewSession = useCallback(() => {
    setCurrentSessionId(null)
    // Clear the "new session" state
    setSessionStates((prev) => {
      const newMap = new Map(prev)
      newMap.delete(NEW_SESSION_KEY)
      return newMap
    })
    setError(null)
  }, [])

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === currentSessionId) {
        return // Already viewing this session
      }

      // Check if we already have this session's state cached
      const cachedState = sessionStates.get(sessionId)
      if (cachedState) {
        // Instant switch - no need to reload
        setCurrentSessionId(sessionId)
        setError(null)
        return
      }

      // Need to load from server
      loadSession(sessionId)
      setError(null)
    },
    [currentSessionId, sessionStates, loadSession]
  )

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const token = await getIdToken()
        if (!token) return
        await deleteSession(token, sessionId)

        // Remove from sessions list
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))

        // Remove from cached states
        setSessionStates((prev) => {
          const newMap = new Map(prev)
          newMap.delete(sessionId)
          return newMap
        })

        // If viewing the deleted session, go to new session
        if (currentSessionId === sessionId) {
          handleNewSession()
        }
      } catch (err) {
        console.error("Failed to delete session:", err)
        setError("Failed to delete conversation")
      }
    },
    [getIdToken, currentSessionId, handleNewSession]
  )

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Capture the session we're sending to (null for new session)
      const targetSessionId = currentSessionId
      const targetKey = targetSessionId ?? NEW_SESSION_KEY

      const userMessage: Message = { role: "user", content }

      // Add user message to target session
      updateSessionState(targetSessionId, (prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isStreaming: true,
      }))
      setError(null)

      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error("Not authenticated")
        }

        let assistantContent = ""
        let newSessionId = targetSessionId

        // Add empty assistant message
        const assistantMessage: Message = { role: "assistant", content: "" }
        updateSessionState(targetSessionId, (prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }))

        for await (const event of streamChat(token, content, targetSessionId)) {
          switch (event.type) {
            case "session":
              if (event.session_id && event.session_id !== targetSessionId) {
                // New session was created - migrate state from NEW_SESSION_KEY to actual ID
                newSessionId = event.session_id

                setSessionStates((prev) => {
                  const newMap = new Map(prev)
                  const currentState = prev.get(targetKey)
                  if (currentState) {
                    // Move state to new session ID
                    newMap.set(event.session_id!, currentState)
                    // Remove old key if it was the new session placeholder
                    if (targetKey === NEW_SESSION_KEY) {
                      newMap.delete(NEW_SESSION_KEY)
                    }
                  }
                  return newMap
                })

                // Update current session ID to the new one
                setCurrentSessionId(event.session_id)
              }
              break

            case "content":
              if (event.content) {
                assistantContent += event.content
                // Update the correct session (might have changed from NEW to actual ID)
                const updateKey = newSessionId ?? targetKey
                setSessionStates((prev) => {
                  const newMap = new Map(prev)
                  const state = prev.get(updateKey)
                  if (state) {
                    const updatedMessages = [...state.messages]
                    const lastMessage = updatedMessages[updatedMessages.length - 1]
                    if (lastMessage?.role === "assistant") {
                      // Create new message object to avoid mutation
                      updatedMessages[updatedMessages.length - 1] = {
                        ...lastMessage,
                        content: assistantContent,
                      }
                    }
                    newMap.set(updateKey, { ...state, messages: updatedMessages })
                  }
                  return newMap
                })
              }
              break

            case "error":
            case "blocked":
              assistantContent =
                event.message || "I'm sorry, I couldn't process that request."
              const errorKey = newSessionId ?? targetKey
              setSessionStates((prev) => {
                const newMap = new Map(prev)
                const state = prev.get(errorKey)
                if (state) {
                  const updatedMessages = [...state.messages]
                  const lastMessage = updatedMessages[updatedMessages.length - 1]
                  if (lastMessage?.role === "assistant") {
                    updatedMessages[updatedMessages.length - 1] = {
                      ...lastMessage,
                      content: assistantContent,
                    }
                  }
                  newMap.set(errorKey, { ...state, messages: updatedMessages })
                }
                return newMap
              })
              break

            case "done":
              break
          }
        }

        // Refresh sessions list to get updated titles
        if (newSessionId !== targetSessionId || !targetSessionId) {
          await loadSessions()
        }
      } catch (err) {
        console.error("Chat error:", err)
        setError(err instanceof Error ? err.message : "Failed to send message")

        // Remove the empty assistant message on error
        const errorKey = targetKey
        setSessionStates((prev) => {
          const newMap = new Map(prev)
          const state = prev.get(errorKey)
          if (state) {
            const updatedMessages = [...state.messages]
            const lastMessage = updatedMessages[updatedMessages.length - 1]
            if (lastMessage?.role === "assistant" && !lastMessage.content) {
              updatedMessages.pop()
            }
            newMap.set(errorKey, { ...state, messages: updatedMessages })
          }
          return newMap
        })
      } finally {
        // Mark streaming as complete for the final session key
        const finalKey = currentSessionId ?? targetKey
        setSessionStates((prev) => {
          const newMap = new Map(prev)
          const state = prev.get(finalKey)
          if (state) {
            newMap.set(finalKey, { ...state, isStreaming: false })
          }
          return newMap
        })
      }
    },
    [getIdToken, currentSessionId, updateSessionState, loadSessions]
  )

  const clearCurrentSession = useCallback(() => {
    setCurrentSessionId(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        sessions,
        sessionsLoading,
        currentSessionId,
        messages,
        isStreaming,
        error,
        loadSessions,
        loadSession,
        handleNewSession,
        handleSelectSession,
        handleDeleteSession,
        handleSendMessage,
        clearCurrentSession,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
