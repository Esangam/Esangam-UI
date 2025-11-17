import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/client'
import { useAuth } from '../state/AuthContext'

export type NotificationMessage = {
  id: number
  text: string
}

/**
 * Opens a personal SSE stream for the logged-in user.
 * Backend uses mobile query param.
 */
export const useNotifications = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<NotificationMessage[]>([])

  useEffect(() => {
    if (!user) return

    const es = new EventSource(
      `${API_BASE_URL}/notifications/stream?mobile=${encodeURIComponent(user.mobile)}`
    )

    es.onmessage = (event) => {
      const text = event.data as string
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), text }
      ])
    }

    es.onerror = () => {
      es.close()
    }

    return () => {
      es.close()
    }
  }, [user])

  const dismiss = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  return { messages, dismiss }
}
