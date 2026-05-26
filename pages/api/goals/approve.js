import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'goals.json')

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { goalId, user } = req.body
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  const goal = data.goals.find(g => g.id === goalId)
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' })
  }

  // Add user to approvedBy
  if (!goal.approvedBy.includes(user)) {
    goal.approvedBy.push(user)
  }

  // Remove from needsApprovalFrom
  goal.needsApprovalFrom = goal.needsApprovalFrom.filter(u => u !== user)

  // If both approved, mark as active
  if (goal.approvedBy.length === 2) {
    goal.status = 'active'
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  res.status(200).json({ success: true })
}
