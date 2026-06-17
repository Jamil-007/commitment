import { getGoalsData, setGoals } from '../../../lib/firestore'

export default async function handler(req, res) {
  console.log('🚀 [CREATE] API called, method:', req.method)
  
  if (req.method !== 'POST') {
    console.log('❌ [CREATE] Wrong method:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { title, type, proposedBy, deadline } = req.body
    console.log('📝 [CREATE] Request body:', { title, type, proposedBy, deadline })
    
    console.log('📥 [CREATE] Fetching existing goals...')
    const goals = await getGoalsData()
    console.log('✅ [CREATE] Got goals, count:', goals.length)

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
    console.log('🎯 [CREATE] New goal created:', newGoal)

    goals.push(newGoal)
    console.log('💾 [CREATE] Saving to Firestore...')
    await setGoals(goals)
    console.log('✅ [CREATE] Saved successfully!')

    res.status(200).json({ success: true, goal: newGoal })
  } catch (error) {
    console.error('❌ [CREATE] Error creating goal:', error)
    console.error('❌ [CREATE] Error stack:', error.stack)
    res.status(500).json({ error: error.message, details: error.toString() })
  }
}
