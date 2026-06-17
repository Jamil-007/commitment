import { getGoalsData, setGoals } from '../../../lib/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { goalId, taskId, user } = req.body
    
    
    const goals = await getGoalsData()
    

    const goal = goals.find(g => g.id === goalId)
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    const task = goal.tasks.find(t => t.id === taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (task.completedBy.includes(user)) {
      task.completedBy = task.completedBy.filter(u => u !== user)
    } else {
      task.completedBy.push(user)
    }

    const allTasksComplete = goal.tasks.every(t => 
      t.completedBy.includes('Jamil') && t.completedBy.includes('Jerald')
    )

    if (allTasksComplete && goal.tasks.length > 0) {
      goal.status = 'completed'
    } else if (goal.status === 'completed') {
      goal.status = 'active'
    }

    await setGoals(goals)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error toggling task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
}
