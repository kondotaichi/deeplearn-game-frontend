// pages/signup.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      // サインアップ後は自動的にログイン状態になるのでコース一覧へ
      router.push('/courses')
    } catch (err) {
      console.error(err)
      setError('このメールアドレスは既に使用されているか、パスワードが短すぎます。')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h1>新規登録</h1>
      <form onSubmit={handleSignup}>
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
          <label htmlFor="password">パスワード (6文字以上)</label>
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
          登録する
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link href="/login">
          アカウントをお持ちですか？ ログイン
        </Link>
      </div>
    </div>
  )
}
