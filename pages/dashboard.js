import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const [goals, setGoals] = useState([])
  const [showNewGoal, setShowNewGoal] = useState(false)
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
    const res = await fetch('/api/goals')
    const data = await res.json()
    setGoals(data.goals)
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
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            💪 Commitment
          </h1>
          <p style={{ color: '#6b7280' }}>
            Welcome back, <strong>{currentUser}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowNewGoal(true)}
            style={{
              background: '#3b82f6',
              color: 'white'
            }}
          >
            + New Goal
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#e5e7eb',
              color: '#4b5563'
            }}
          >
            Logout
          </button>
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

      {/* Pending Proposals */}
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

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Section title="✅ Completed" color="#10b981">
          {completedGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} currentUser={currentUser} onUpdate={loadGoals} completed />
          ))}
        </Section>
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
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '2px solid #f59e0b'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {goal.title}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
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
              padding: '0.5rem 1rem'
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
              padding: '0.5rem 1rem'
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
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState('')

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    await fetch('/api/goals/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalId: goal.id,
        description: newTask
      })
    })
    
    setNewTask('')
    setShowAddTask(false)
    onUpdate()
  }

  const handleToggleTask = async (taskId) => {
    await fetch('/api/goals/toggle-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalId: goal.id,
        taskId,
        user: currentUser
      })
    })
    onUpdate()
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      opacity: completed ? 0.7 : 1
    }}>
      <h3 style={{
        fontSize: '1.2rem',
        marginBottom: '1rem',
        textDecoration: completed ? 'line-through' : 'none'
      }}>
        {goal.title}
      </h3>

      {/* Tasks */}
      {goal.tasks && goal.tasks.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {goal.tasks.map(task => {
            const jamilDone = task.completedBy.includes('Jamil')
            const jeraldDone = task.completedBy.includes('Jerald')
            const allDone = jamilDone && jeraldDone

            return (
              <div
                key={task.id}
                style={{
                  padding: '0.75rem',
                  background: allDone ? '#f0fdf4' : '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: allDone ? 'line-through' : 'none'
                }}
              >
                <span>{task.description}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {jamilDone && '✅ Jamil'}{jamilDone && jeraldDone && ' • '}
                    {jeraldDone && '✅ Jerald'}
                  </span>
                  {!allDone && (
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      style={{
                        background: task.completedBy.includes(currentUser) ? '#e5e7eb' : '#3b82f6',
                        color: task.completedBy.includes(currentUser) ? '#4b5563' : 'white',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      {task.completedBy.includes(currentUser) ? 'Undo' : 'Done'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task */}
      {!completed && (
        <>
          {showAddTask ? (
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="New task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                style={{
                  background: '#3b82f6',
                  color: 'white'
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                style={{
                  background: '#e5e7eb',
                  color: '#4b5563'
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              style={{
                background: '#f3f4f6',
                color: '#4b5563',
                width: '100%',
                padding: '0.75rem'
              }}
            >
              + Add Task
            </button>
          )}
        </>
      )}
    </div>
  )
}

function NewGoalModal({ currentUser, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('short-term')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    await fetch('/api/goals/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        type,
        proposedBy: currentUser
      })
    })

    onSuccess()
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
        padding: '2rem',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Propose New Goal
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g., Launch side project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Time Frame
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: '#e5e7eb',
                color: '#4b5563'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white'
              }}
            >
              Propose Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
