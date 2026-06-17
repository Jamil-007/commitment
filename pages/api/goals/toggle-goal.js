import { getGoalsData, setGoals } from '../../../lib/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { goalId, user } = req.body
    
    
    const goals = await getGoalsData()
    

    const goal = goals.find(g => g.id === goalId)
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    // Initialize completedBy if it doesn't exist
    if (!goal.completedBy) {
      goal.completedBy = []
    }

    // Toggle completion
    if (goal.completedBy.includes(user)) {
      goal.completedBy = goal.completedBy.filter(u => u !== user)
    } else {
      goal.completedBy.push(user)
    }

    // Check if both completed
    if (goal.completedBy.includes('Jamil') && goal.completedBy.includes('Jerald')) {
      goal.status = 'completed'
    } else if (goal.status === 'completed') {
      goal.status = 'active' // Uncomplete if someone undoes
    }

    await setGoals(goals)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error toggling goal:', error)
    res.status(500).json({ error: 'Failed to update goal' })
  }
}
