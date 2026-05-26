import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'goals.json')

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, type, proposedBy } = req.body
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  const otherUser = proposedBy === 'Jamil' ? 'Jerald' : 'Jamil'

  const newGoal = {
    id: Date.now(),
    title,
    type,
    status: 'pending',
    proposedBy,
    approvedBy: [proposedBy], // Auto-approved by proposer
    needsApprovalFrom: [otherUser],
    tasks: [],
    createdAt: new Date().toISOString()
  }

  data.goals.push(newGoal)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  res.status(200).json({ success: true })
}
