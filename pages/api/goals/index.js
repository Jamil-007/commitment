import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'goals.json')

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    res.status(200).json(data)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
