import { getGoalsData, setGoals } from '../../../lib/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { goalId } = req.body
    
    const goals = await getGoalsData()
    const filteredGoals = goals.filter(g => g.id !== goalId)

    await setGoals(filteredGoals)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error rejecting goal:', error)
    res.status(500).json({ error: 'Failed to reject goal' })
  }
}
