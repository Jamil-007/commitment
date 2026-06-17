// Firestore via the REST API (plain HTTPS, no SDK, no gRPC streaming).
// This avoids the serverless hang that the client SDK caused and needs no
// service account — just the public Firebase API key. Access is therefore
// governed by your Firestore security rules (they must allow read/write).

const PROJECT_ID = 'nigs-commitment'
const API_KEY =
  process.env.FIREBASE_API_KEY || 'AIzaSyA6kTZ0TOpNTuIR5x3YjjMGPtXcZhG_ipU'

// We store the entire goals list as a single JSON string in one document
// (data/goals), which keeps REST value-encoding trivial.
const DOC_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/data/goals?key=${API_KEY}`

// Hard timeout so a request can never hang the serverless function.
async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

// Goals collection operations (single-document blob storage)
export async function getGoals() {
  return getGoalsData()
}

export async function setGoals(goals) {
  console.log('💾 [FIRESTORE] Saving goals, count:', goals.length)
  const body = {
    fields: {
      json: { stringValue: JSON.stringify(goals) },
      updatedAt: { stringValue: new Date().toISOString() },
    },
  }
  // PATCH creates the document if it doesn't exist, or overwrites it.
  const res = await fetchWithTimeout(DOC_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('❌ [FIRESTORE] Save failed:', res.status, text)
    throw new Error(`Firestore write failed (${res.status}): ${text}`)
  }
  console.log('✅ [FIRESTORE] Goals saved successfully!')
  return true
}

export async function getGoalsData() {
  try {
    console.log('📥 [FIRESTORE] Getting goals data...')
    const res = await fetchWithTimeout(DOC_URL)

    if (res.status === 404) {
      console.log('⚠️ [FIRESTORE] No goals document found, returning empty array')
      return []
    }
    if (!res.ok) {
      const text = await res.text()
      console.error('❌ [FIRESTORE] Read failed:', res.status, text)
      return []
    }

    const data = await res.json()
    const raw = data?.fields?.json?.stringValue
    const goals = raw ? JSON.parse(raw) : []
    console.log('✅ [FIRESTORE] Got goals, count:', goals.length)
    return goals
  } catch (error) {
    console.error('❌ [FIRESTORE] Error getting goals data:', error)
    return []
  }
}

export async function deleteGoals() {
  const res = await fetchWithTimeout(DOC_URL, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`Firestore delete failed (${res.status}): ${text}`)
  }
  return true
}
