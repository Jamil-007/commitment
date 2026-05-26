import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'goals.json')

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { goalId } = req.body
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Remove the goal completely
  data.goals = data.goals.filter(g => g.id !== goalId)

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  res.status(200).json({ success: true })
}
