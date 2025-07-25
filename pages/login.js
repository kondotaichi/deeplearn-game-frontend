// pages/login.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/courses')
    } catch (err) {
      console.error(err)
      setError('メールアドレスまたはパスワードが間違っています。')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h1>ログイン</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 15 }}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >
          ログイン
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link href="/signup">
          アカウントをお持ちでないですか？ 新規登録
        </Link>
      </div>
    </div>
  )
}
