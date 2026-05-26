import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'goals.json')

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { goalId, taskId, user } = req.body
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  const goal = data.goals.find(g => g.id === goalId)
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' })
  }

  const task = goal.tasks.find(t => t.id === taskId)
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }

  // Toggle completion
  if (task.completedBy.includes(user)) {
    task.completedBy = task.completedBy.filter(u => u !== user)
  } else {
    task.completedBy.push(user)
  }

  // Check if all tasks are completed by both users
  const allTasksComplete = goal.tasks.every(t => 
    t.completedBy.includes('Jamil') && t.completedBy.includes('Jerald')
  )

  if (allTasksComplete && goal.tasks.length > 0) {
    goal.status = 'completed'
  } else if (goal.status === 'completed') {
    goal.status = 'active' // Uncomplete if someone undoes
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  res.status(200).json({ success: true })
}
