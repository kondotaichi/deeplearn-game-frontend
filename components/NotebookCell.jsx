// components/NotebookCell.jsx
import { useState } from 'react'

export default function NotebookCell({ cell, onExecute }) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [output, setOutput] = useState([])
  const [executionTime, setExecutionTime] = useState(null)

  const handleExecute = async () => {
    setIsExecuting(true)
    setOutput([])
    setExecutionTime(null)

    const start = Date.now()
    await onExecute(cell.source, (chunk) => {
      // chunk: { data, execution_time? }
      if (chunk.execution_time != null) {
        setExecutionTime(chunk.execution_time)
      } else {
        setOutput(prev => [...prev, chunk.data])
      }
    })
    const end = Date.now()
    // WebSocket から execution_time が来ない場合のフォールバック
    if (executionTime == null) {
      setExecutionTime(((end - start) / 1000).toFixed(2))
    }
    setIsExecuting(false)
  }

  return (
    <div className="cell border p-4 mb-4 rounded">
      <pre className="bg-gray-100 p-2 rounded">
        {cell.source.join('')}
      </pre>
      <div className="flex items-center space-x-2 mt-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          Run
        </button>
        {isExecuting && (
          <span className="text-sm text-gray-600">⏳ 実行中…</span>
        )}
        {executionTime && (
          <span className="text-sm text-gray-600">
            🕒 {executionTime}s
          </span>
        )}
      </div>
      <div className="output mt-2 bg-black text-white p-2 rounded">
        {output.map((out,i) => (
          <pre key={i}>{out}</pre>
        ))}
      </div>
    </div>
  )
}
