const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Session {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SessionDetail extends Session {
  messages: Message[];
}

export type ChatEventType = "session" | "content" | "done" | "error" | "blocked";

export interface ChatEvent {
  type: ChatEventType;
  session_id?: string;
  content?: string;
  message?: string;
}

export async function fetchSessions(token: string): Promise<Session[]> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status}`);
  }

  return response.json();
}

export async function fetchSession(
  token: string,
  sessionId: string
): Promise<SessionDetail> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.status}`);
  }

  return response.json();
}

export async function deleteSession(
  token: string,
  sessionId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete session: ${response.status}`);
  }
}

export async function* streamChat(
  token: string,
  message: string,
  sessionId: string | null
): AsyncGenerator<ChatEvent> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const terminalEventTypes: ChatEventType[] = ["done", "error", "blocked"];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data) continue;

      try {
        const event: ChatEvent = JSON.parse(data);
        yield event;
        if (terminalEventTypes.includes(event.type)) {
          try {
            await reader.cancel();
          } catch {
            // ignore cancellation errors
          }
          return;
        }
      } catch {
        console.error("Failed to parse SSE event:", data);
      }
    }
  }

  // Process any remaining buffer
  if (buffer.startsWith("data: ")) {
    const data = buffer.slice(6).trim();
    if (data) {
      try {
        const event: ChatEvent = JSON.parse(data);
        yield event;
        if (terminalEventTypes.includes(event.type)) {
          return;
        }
      } catch {
        console.error("Failed to parse final SSE event:", data);
      }
    }
  }
}
