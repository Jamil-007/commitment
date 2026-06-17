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

    if (!goal.approvedBy.includes(user)) {
      goal.approvedBy.push(user)
    }

    goal.needsApprovalFrom = goal.needsApprovalFrom.filter(u => u !== user)

    if (goal.approvedBy.length === 2) {
      goal.status = 'active'
    }

    await setGoals(goals)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error approving goal:', error)
    res.status(500).json({ error: error.message })
  }
}
