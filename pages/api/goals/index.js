import { getGoalsData } from '../../../lib/firestore'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const goals = await getGoalsData()
      res.status(200).json({ goals })
    } catch (error) {
      console.error('Error fetching goals:', error)
      res.status(200).json({ goals: [] })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
