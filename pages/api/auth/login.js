export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, password } = req.body

  const validCredentials = {
    'Jamil': process.env.JAMIL_PASSWORD || 'jamil2026',
    'Jerald': process.env.JERALD_PASSWORD || 'jerald2026'
  }

  if (validCredentials[user] === password) {
    res.status(200).json({ success: true })
  } else {
    res.status(401).json({ success: false })
  }
}
