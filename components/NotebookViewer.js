import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useState, useContext, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'

// WebSocket のベース URL
const WS_BASE = process.env.NEXT_PUBLIC_BACKEND_WS || "ws://localhost:8000"

export default function NotebookViewer({ notebook, courseId = 1 }) {
  if (!notebook || !Array.isArray(notebook.cells)) {
    return <div>読み込み中…</div>
  }
  return (
    <div>
      {notebook.cells.map((cell, i) => (
        <Cell key={i} cell={cell} index={i} courseId={courseId} />
      ))}
    </div>
  )
}

function Cell({ cell, index, courseId }) {
  const [outputs, setOutputs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const { user } = useContext(AuthContext)
  const wsRef = useRef(null)

  const handleRun = async () => {
    if (!user) {
      alert("ログインが必要です。")
      return
    }
    setIsLoading(true)
    setOutputs([])
    setErrorMsg("")

    // 古い WS が残っていたら切る
    if (wsRef.current) {
      wsRef.current.close()
    }

    let idToken
    try {
      idToken = await user.getIdToken()
    } catch (e) {
      setErrorMsg("IDトークン取得に失敗しました")
      setIsLoading(false)
      return
    }

    // WebSocket を開く
    const ws = new WebSocket(`${WS_BASE}/api/v1/ws/jupyter/${courseId}?token=${idToken}`)
    wsRef.current = ws

    ws.onopen = () => {
      // 最小限の execute_request を送ると、バックエンドで
      // 正しい Jupyter プロトコルにラップしてくれます
      ws.send(JSON.stringify({
        header: { msg_type: 'execute_request' },
        parent_header: {},
        metadata: {},
        content: { code: cell.source.join(''), silent: false },
      }))
    }

    ws.onmessage = (e) => {
      // まずは中身を確認
      console.log('WS ←', e.data)
      let msg
      try {
        msg = JSON.parse(e.data)
      } catch {
        console.warn('非 JSON メッセージ', e.data)
        return
      }

      // stream: print() の出力
      if (msg.header?.msg_type === 'stream') {
        setOutputs(o => [...o, msg.content.text])
      }
      // execute_result: return value の出力
      else if (msg.header?.msg_type === 'execute_result') {
        const txt = msg.content.data['text/plain']
        setOutputs(o => [...o, txt])
      }
      // error: 例外
      else if (msg.header?.msg_type === 'error') {
        setOutputs(o => [...o, `[ERROR] ${msg.content.ename}: ${msg.content.evalue}`])
      }
      // execute_reply: 実行完了
      else if (msg.header?.msg_type === 'execute_reply') {
        setIsLoading(false)
        // execution_time があれば表示
        if (msg.execution_time != null) {
          setOutputs(o => [...o, `[実行時間: ${msg.execution_time}s]`])
        }
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket エラー', err)
      setErrorMsg("WebSocket エラーが発生しました")
      setIsLoading(false)
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
      setIsLoading(false)
    }
  }

  // code セルだけ実行可能
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
          disabled={isLoading || !user}
          style={{ marginTop: 10 }}
        >
          {isLoading ? '実行中…' : '実行'}
        </button>
        <div style={{ marginTop: 10 }}>
          {outputs.map((o, i) => (
            <pre
              key={i}
              style={{
                whiteSpace: 'pre-wrap',
                color: o.startsWith("[ERROR]") ? 'red' : undefined
              }}
            >
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