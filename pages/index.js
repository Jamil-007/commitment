import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [selectedUser, setSelectedUser] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setPassword('')
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: selectedUser, password })
    })

    const data = await res.json()

    if (data.success) {
      localStorage.setItem('currentUser', selectedUser)
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          💪 Commitment
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
          Accountability for growth
        </p>

        {!selectedUser ? (
          <>
            <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
              Who are you?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => handleUserSelect('Jamil')}
                style={{
                  flex: 1,
                  background: '#3b82f6',
                  color: 'white',
                  padding: '1.5rem',
                  fontSize: '1.2rem'
                }}
              >
                Jamil
              </button>
              <button 
                onClick={() => handleUserSelect('Jerald')}
                style={{
                  flex: 1,
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '1.5rem',
                  fontSize: '1.2rem'
                }}
              >
                Jerald
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleLogin}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>
              Welcome, <strong>{selectedUser}</strong>!
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ marginBottom: '1rem' }}
            />
            {error && (
              <p style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{
                  flex: 1,
                  background: '#e5e7eb',
                  color: '#4b5563'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: selectedUser === 'Jamil' ? '#3b82f6' : '#8b5cf6',
                  color: 'white'
                }}
              >
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
