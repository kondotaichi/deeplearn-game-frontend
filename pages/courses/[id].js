// pages/courses/[id].js

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
  const [ws, setWs] = useState(null)      // ← ref ではなく state

  // Firebase トークン取得
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) setToken(await u.getIdToken())
      else router.push('/login')
    })
    return () => unsub()
  }, [router])

  // ノートブック取得
  useEffect(() => {
    if (!id || !token) return
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    fetch(`${BACKEND}/api/v1/courses/${id}/notebook`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setNotebook)
      .catch(() => setError('ノートブック取得失敗'))
  }, [id, token])

  // WebSocket 初期化（ノートブック取得後に一度だけ）
  useEffect(() => {
    if (!notebook || !token || ws) return

    const socket = new WebSocket(
      `ws://localhost:8000/api/v1/ws/jupyter/${id}?token=${token}`
    )
    socket.onopen = () => {
      console.log('WebSocket opened')
      setWs(socket)   // ← state にセットして再レンダー
    }
    socket.onerror = (e) => console.error('WebSocket error', e)
    socket.onclose = () => console.log('WebSocket closed')

    return () => socket.close()
  }, [notebook, id, token, ws])

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!notebook) return <div>読み込み中…</div>

  return (
    <div style={{ padding: 16 }}>
      <h1>講座 {id} のノートブック</h1>
      {/* ws が null のときはまだ接続中、ws が入ってからレンダリング */}
      <NotebookViewer notebook={notebook} ws={ws} />
    </div>
  )
}