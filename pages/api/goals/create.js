import { getGoalsData, setGoals } from '../../../lib/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { title, type, proposedBy, deadline } = req.body
    
    const goals = await getGoalsData()

    const otherUser = proposedBy === 'Jamil' ? 'Jerald' : 'Jamil'

    const newGoal = {
      id: Date.now(),
      title,
      type,
      status: 'pending',
      proposedBy,
      approvedBy: [proposedBy],
      needsApprovalFrom: [otherUser],
      deadline: deadline || null,
      completedBy: [],
      tasks: [],
      createdAt: new Date().toISOString()
    }

    goals.push(newGoal)
    await setGoals(goals)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ error: error.message })
  }
}
