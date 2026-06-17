import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const [goals, setGoals] = useState([])
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user) {
      router.push('/')
    } else {
      setCurrentUser(user)
      loadGoals()
    }
  }, [])

  const loadGoals = async () => {
    const res = await fetch('/api/goals', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await res.json()
    console.log('Loaded goals:', data.goals)
    setGoals(data.goals || [])
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/')
  }

  const pendingGoals = goals.filter(g => g.status === 'pending')
  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  const shortTerm = activeGoals.filter(g => g.type === 'short-term')
  const mediumTerm = activeGoals.filter(g => g.type === 'medium-term')
  const longTerm = activeGoals.filter(g => g.type === 'long-term')

  if (!currentUser) return null

  return (
    <div className="container" style={{ 
      paddingTop: '1rem', 
      paddingBottom: '2rem',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              💪 Commitment
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Welcome back, <strong>{currentUser}</strong>
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setShowNewGoal(true)}
              style={{
                background: '#3b82f6',
                color: 'white',
                flex: '1 1 auto',
                minWidth: '120px'
              }}
            >
              + New Goal
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: '#e5e7eb',
                color: '#4b5563',
                flex: '0 1 auto',
                minWidth: '80px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoal && (
        <NewGoalModal
          currentUser={currentUser}
          onClose={() => setShowNewGoal(false)}
          onSuccess={() => {
            setShowNewGoal(false)
            loadGoals()
          }}
        />
      )}

      {/* Pending Proposals - Waiting for approval */}
      {pendingGoals.filter(g => g.needsApprovalFrom.includes(currentUser)).length > 0 && (
        <Section title="⏳ Pending Your Approval" color="#f59e0b">
          {pendingGoals
            .filter(g => g.needsApprovalFrom.includes(currentUser))
            .map(goal => (
              <PendingGoalCard
                key={goal.id}
                goal={goal}
                currentUser={currentUser}
                onUpdate={loadGoals}
              />
            ))}
        </Section>
      )}

      {/* Your Proposals - Waiting for others */}
      {pendingGoals.filter(g => g.proposedBy === currentUser && g.needsApprovalFrom.length > 0).length > 0 && (
        <Section title="📤 Your Proposals (Awaiting Approval)" color="#6b7280">
          {pendingGoals
            .filter(g => g.proposedBy === currentUser && g.needsApprovalFrom.length > 0)
            .map(goal => (
              <div key={goal.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: '#f59e0b',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>
                  Pending
                </div>
                <GoalCard 
                  goal={goal} 
                  currentUser={currentUser} 
                  onUpdate={loadGoals} 
                />
              </div>
            ))}
        </Section>
      )}

      {/* Active Goals */}
      {shortTerm.length > 0 && (
        <Section title="🔥 Short-term (Days)" color="#ef4444">
          {shortTerm.map(goal => (
            <GoalCard key={goal.id} goal={goal} currentUser={currentUser} onUpdate={loadGoals} />
          ))}
        </Section>
      )}

      {mediumTerm.length > 0 && (
        <Section title="⚡ Medium-term (Weeks)" color="#3b82f6">
          {mediumTerm.map(goal => (
            <GoalCard key={goal.id} goal={goal} currentUser={currentUser} onUpdate={loadGoals} />
          ))}
        </Section>
      )}

      {longTerm.length > 0 && (
        <Section title="🎯 Long-term (Months)" color="#8b5cf6">
          {longTerm.map(goal => (
            <GoalCard key={goal.id} goal={goal} currentUser={currentUser} onUpdate={loadGoals} />
          ))}
        </Section>
      )}

      {/* Completed Goals - Collapsible */}
      {completedGoals.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div 
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>
              ✅ Completed ({completedGoals.length})
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>
              {showCompleted ? '▼' : '▶'}
            </span>
          </div>
          {showCompleted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completedGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} currentUser={currentUser} onUpdate={loadGoals} completed />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '4rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</p>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No goals yet!</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Start by proposing your first goal.
          </p>
          <button
            onClick={() => setShowNewGoal(true)}
            style={{
              background: '#3b82f6',
              color: 'white',
              fontSize: '1.1rem'
            }}
          >
            + Create First Goal
          </button>
        </div>
      )}
    </div>
  )
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '1.3rem',
        marginBottom: '1rem',
        color: color,
        fontWeight: 'bold'
      }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

function PendingGoalCard({ goal, currentUser, onUpdate }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await fetch('/api/goals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId: goal.id, user: currentUser })
    })
    onUpdate()
  }

  const handleReject = async () => {
    setLoading(true)
    await fetch('/api/goals/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId: goal.id })
    })
    onUpdate()
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '2px solid #f59e0b'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
            {goal.title}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
            Proposed by <strong>{goal.proposedBy}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleApprove}
            disabled={loading}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.6rem 1rem',
              flex: 1
            }}
          >
            ✓ Approve
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.6rem 1rem',
              flex: 1
            }}
          >
            ✗ Reject
          </button>
        </div>
      </div>
    </div>
  )
}

function GoalCard({ goal, currentUser, onUpdate, completed }) {
  const [isEditingDeadline, setIsEditingDeadline] = useState(false)
  const [newDeadline, setNewDeadline] = useState(goal.deadline || '')

  const handleToggleGoal = async () => {
    await fetch('/api/goals/toggle-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalId: goal.id,
        user: currentUser
      })
    })
    onUpdate()
  }

  const handleUpdateDeadline = async () => {
    await fetch('/api/goals/update-deadline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalId: goal.id,
        deadline: newDeadline || null
      })
    })
    setIsEditingDeadline(false)
    onUpdate()
  }

  const jamilDone = goal.completedBy?.includes('Jamil') || false
  const jeraldDone = goal.completedBy?.includes('Jerald') || false
  const allDone = jamilDone && jeraldDone

  // Calculate deadline status
  let deadlineColor = '#6b7280'
  let deadlineText = ''
  if (goal.deadline) {
    const deadline = new Date(goal.deadline)
    const now = new Date()
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) {
      deadlineColor = '#ef4444'
      deadlineText = `⚠️ Overdue by ${Math.abs(daysLeft)} day(s)`
    } else if (daysLeft === 0) {
      deadlineColor = '#f59e0b'
      deadlineText = '⏰ Due today!'
    } else if (daysLeft <= 3) {
      deadlineColor = '#f59e0b'
      deadlineText = `⏰ ${daysLeft} day(s) left`
    } else {
      deadlineText = `📅 Due ${deadline.toLocaleDateString()}`
    }
  }

  return (
    <div style={{
      background: allDone ? '#f0fdf4' : 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      opacity: completed ? 0.7 : 1
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'start',
        gap: '0.75rem'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1.1rem',
            textDecoration: completed ? 'line-through' : 'none',
            wordBreak: 'break-word',
            marginBottom: (jamilDone || jeraldDone) ? '0.5rem' : 0
          }}>
            {goal.title}
          </h3>
          
          {(jamilDone || jeraldDone) && (
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {jamilDone && '✅ Jamil'}
              {jamilDone && jeraldDone && ' • '}
              {jeraldDone && '✅ Jerald'}
            </span>
          )}
        </div>
        
        {!allDone && (
          <button
            onClick={handleToggleGoal}
            style={{
              background: goal.completedBy?.includes(currentUser) ? '#e5e7eb' : '#10b981',
              color: goal.completedBy?.includes(currentUser) ? '#4b5563' : 'white',
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {goal.completedBy?.includes(currentUser) ? 'Undo' : 'Done'}
          </button>
        )}
      </div>
      
      {/* Deadline section */}
      {!completed && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.5rem', 
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          {isEditingDeadline && goal.status !== 'active' ? (
            <>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleUpdateDeadline}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    flex: 1
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingDeadline(false)
                    setNewDeadline(goal.deadline || '')
                  }}
                  style={{
                    background: '#e5e7eb',
                    color: '#4b5563',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.85rem', color: deadlineColor }}>
                {deadlineText || '📅 No deadline'}
              </span>
              {goal.status !== 'active' && (
                <button
                  onClick={() => setIsEditingDeadline(true)}
                  style={{
                    background: 'transparent',
                    color: '#6b7280',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.85rem',
                    border: '1px solid #d1d5db'
                  }}
                >
                  {goal.deadline ? 'Edit' : 'Set deadline'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NewGoalModal({ currentUser, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('short-term')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🚀 [FRONTEND] Form submitted')
    setError('')
    
    if (!title.trim()) {
      console.log('❌ [FRONTEND] Empty title')
      setError('Please enter a goal title')
      return
    }

    console.log('🔄 [FRONTEND] Setting loading state...')
    setLoading(true)
    
    try {
      const payload = {
        title: title.trim(),
        type,
        proposedBy: currentUser,
        deadline: deadline || null
      }
      console.log('📤 [FRONTEND] Sending request:', payload)
      
      const response = await fetch('/api/goals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📥 [FRONTEND] Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [FRONTEND] API error:', errorData)
        throw new Error(errorData.error || 'Failed to create goal')
      }

      const data = await response.json()
      console.log('✅ [FRONTEND] Success!', data)
      onSuccess()
    } catch (err) {
      console.error('❌ [FRONTEND] Caught error:', err)
      setError(err.message || 'Failed to create goal. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Propose New Goal
        </h2>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #ef4444',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g., Launch side project"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError('')
              }}
              autoFocus
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Time Frame
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem'
              }}
            >
              <option value="short-term">Short-term (Days)</option>
              <option value="medium-term">Medium-term (Weeks)</option>
              <option value="long-term">Long-term (Months)</option>
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                background: '#e5e7eb',
                color: '#4b5563',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white',
                opacity: (loading || !title.trim()) ? 0.6 : 1,
                cursor: (loading || !title.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Propose Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
