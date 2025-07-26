import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import NotebookViewer from '../../components/NotebookViewer'

export default function NotebookPage() {
  const router = useRouter()
  const { id } = router.query

  const [token, setToken] = useState(null)
  const [notebook, setNotebook] = useState(null)
  const [error, setError] = useState(null)
  const [ws, setWs] = useState(null)

  // Firebase トークン取得
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const t = await u.getIdToken()
        setToken(t)
      } else {
        router.push('/login')
      }
    })
    return () => unsub()
  }, [router])

  // ノートブック取得
  useEffect(() => {
    if (!id || !token) return
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    fetch(`${BACKEND}/api/v1/courses/${id}/notebook`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setNotebook)
      .catch(() => setError('ノートブック取得失敗'))
  }, [id, token])

  // WebSocket 接続
  useEffect(() => {
    if (!notebook || !token || ws) return

    const WS_BACKEND = process.env.NEXT_PUBLIC_BACKEND_WS || 'ws://localhost:8000'
    const socket = new WebSocket(`${WS_BACKEND}/api/v1/ws/jupyter/${id}?token=${token}`)

    socket.onopen = () => {
      console.log('WebSocket 接続完了')
      setWs(socket)
    }

    socket.onerror = (e) => {
      console.error('WebSocket 接続エラー', e)
      setError('WebSocket接続失敗')
    }

    socket.onclose = () => {
      console.log('WebSocket 接続終了')
    }

    return () => {
      socket.close()
    }
  }, [notebook, id, token, ws])

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!notebook) return <div>ノートブックを読み込み中...</div>

  return (
    <div style={{ padding: 16 }}>
      <h1>講座 {id} のノートブック</h1>
      {ws ? (
        <NotebookViewer notebook={notebook} ws={ws} />
      ) : (
        <div>WebSocket接続中...</div>
      )}
    </div>
  )
}
