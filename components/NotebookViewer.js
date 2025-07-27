import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
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


function Cell({ cell, onRun }) {
  // 1. セルのコードを編集可能なstateとして保持
  const [code, setCode] = useState(cell.source.join(''));
  const [outputs, setOutputs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handleRun = () => {
    setIsLoading(true);
    setOutputs([]);
    // 2. onRunに渡すコードを、編集後のstate (`code`) に変更
    onRun(code, (outputMessage) => {
      // 実行結果や完了通知を受け取ってstateを更新する
      setOutputs(prev => [...prev, outputMessage]);

      if (outputMessage.type === 'final') {
          setIsLoading(false);
      }
    });
  };

  if (cell.cell_type === 'markdown') {
    return <ReactMarkdown>{cell.source.join('')}</ReactMarkdown>;
  }

  if (cell.cell_type === 'code') {
    return (
      <div style={{ margin: '20px 0' }}>
        {/* 3. SyntaxHighlighterをCodeMirrorに置き換え */}
        <CodeMirror
          value={code}
          height="auto"
          extensions={[python()]}
          onChange={(value) => setCode(value)}
          theme="dark" // ダークテーマを適用
        />
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
        </div>
      </div>
    );
  }

  return null;
}