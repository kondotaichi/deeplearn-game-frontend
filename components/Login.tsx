// components/Login.jsx (簡易的な例)
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is logged in:", user.email);
        const idToken = await user.getIdToken();

        // バックエンドAPIを叩いて認証を確認
        const res = await fetch('http://localhost:8000/api/v1/auth/me', { // バックエンドのURL
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        const data = await res.json();
        console.log("Backend response:", data);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}