import { getGoalsData, setGoals } from '../../../lib/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { goalId, deadline } = req.body
    
    
    const goals = await getGoalsData()
    

    const goal = goals.find(g => g.id === goalId)
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    goal.deadline = deadline

    await setGoals(goals)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error updating deadline:', error)
    res.status(500).json({ error: error.message })
  }
}
