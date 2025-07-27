import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useState, useContext, useRef, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function NotebookViewer({ notebook, courseId = 1 }) {
  const { user } = useContext(AuthContext)
  const [token, setToken] = useState(null)
  const wsRef = useRef(null)

  // トークン取得
  useEffect(() => {
    if (!user) return
    user.getIdToken().then(setToken)
  }, [user])

  // WebSocket 一度だけ接続
  useEffect(() => {
    if (!token || wsRef.current) return
    const base = (() => {
      if (process.env.NEXT_PUBLIC_BACKEND_WS) return process.env.NEXT_PUBLIC_BACKEND_WS
      if (typeof window !== 'undefined') {
        const { protocol, host } = window.location
        const wsProto = protocol === 'https:' ? 'wss:' : 'ws:'
        return `${wsProto}//${host}`
      }
      return 'ws://localhost:8000'
    })()
    const ws = new WebSocket(`${base}/api/v1/ws/jupyter/${courseId}?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => console.log('WebSocket 接続完了')
    ws.onerror = (e) => console.error('WebSocket エラー', e)
    ws.onclose = () => console.log('WebSocket 切断')

    return () => {
      ws.close()
    }
  }, [token, courseId])

  if (!notebook || !Array.isArray(notebook.cells)) {
    return <div>読み込み中…</div>
  }

  return (
    <div>
      {notebook.cells.map((cell, i) => (
        <Cell
          key={i}
          cell={cell}
          courseId={courseId}
          wsRef={wsRef}
          token={token}
        />
      ))}
    </div>
  )
}

function Cell({ cell, courseId, wsRef, token }) {
  const [outputs, setOutputs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleRun = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMsg("WebSocketが接続されていません")
      return
    }
    setIsLoading(true)
    setOutputs([])
    setErrorMsg("")

    const msg = {
      header: { msg_type: 'execute_request', metadata: { courseId } },
      parent_header: {},
      metadata: {},
      content: { code: cell.source.join(''), silent: false },
    }
    wsRef.current.send(JSON.stringify(msg))

    const onMessage = (e) => {
      let msg
      try { msg = JSON.parse(e.data) } catch { return }
      const mtype = msg.header?.msg_type
      if (mtype === 'stream') {
        setOutputs(o => [...o, msg.content.text])
      } else if (mtype === 'execute_result') {
        setOutputs(o => [...o, msg.content.data['text/plain']])
      } else if (mtype === 'error') {
        setOutputs(o => [...o, `[ERROR] ${msg.content.ename}: ${msg.content.evalue}`])
      } else if (mtype === 'execute_reply') {
        setIsLoading(false)
        if (msg.execution_time != null) {
          setOutputs(o => [...o, `[実行時間: ${msg.execution_time}s]`])
        }
        wsRef.current.removeEventListener('message', onMessage)
      }
    }

    wsRef.current.addEventListener('message', onMessage)
  }

  if (cell.cell_type === 'markdown') {
    return <ReactMarkdown>{cell.source.join('')}</ReactMarkdown>
  }
  if (cell.cell_type === 'code') {
    return (
      <div style={{ margin: '20px 0' }}>
        <SyntaxHighlighter language="python" style={materialDark}>
          {cell.source.join('')}
        </SyntaxHighlighter>
        <button
          onClick={handleRun}
          disabled={isLoading || !token}
          style={{ marginTop: 10 }}
        >
          {isLoading ? '実行中…' : '実行'}
        </button>
        <div style={{ marginTop: 10 }}>
          {outputs.map((o, i) => (
            <pre key={i} style={{ whiteSpace: 'pre-wrap', color: o.startsWith("[ERROR]") ? 'red' : undefined }}>
              {o}
            </pre>
          ))}
          {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
        </div>
      </div>
    )
  }
  return null
}
