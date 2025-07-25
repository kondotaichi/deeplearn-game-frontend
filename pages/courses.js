// pages/courses.js

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'

export default function CoursesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // 未認証なら /login へリダイレクト
    if (!loading && !user) {
      router.push('/login')
      return
    }
    // 認証済みなら講座一覧を取得
    if (user) {
      ;(async () => {
        try {
          const token = await user.getIdToken()
          const res = await fetch('http://localhost:8000/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          setCourses(data)
        } catch (err) {
          console.error(err)
          setError('講座の取得に失敗しました')
        }
      })()
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div style={{ padding: 20 }}>読み込み中…</div>
  }
  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>{error}</div>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>講座一覧</h1>
      {courses.map(course => (
        <Link
          key={course.id}
          href={`/courses/${course.id}`}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 16 }}
        >
          <div style={{ border: '1px solid #ccc', borderRadius: 5, padding: 16 }}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
