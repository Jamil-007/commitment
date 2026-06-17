import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize the Firebase Admin SDK (server-side, reliable on serverless).
// Credentials come from a base64-encoded service-account JSON stored in
// the FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable.
let db

function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (!b64) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env var. ' +
        'Add your base64-encoded Firebase service-account JSON to the environment.'
    )
  }
  const json = Buffer.from(b64, 'base64').toString('utf8')
  return JSON.parse(json)
}

function getDB() {
  if (db) return db

  if (!getApps().length) {
    console.log('🔥 [FIRESTORE] Initializing Firebase Admin...')
    initializeApp({ credential: cert(getServiceAccount()) })
    console.log('✅ [FIRESTORE] Firebase Admin initialized')
  }

  db = getFirestore()
  return db
}

// Goals collection operations
export async function getGoals() {
  try {
    const snapshot = await getDB().collection('goals').get()
    if (snapshot.empty) return []
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting goals:', error)
    return []
  }
}

export async function setGoals(goals) {
  try {
    console.log('💾 [FIRESTORE] Saving goals, count:', goals.length)
    // Store as a single document for simplicity (like Redis)
    await getDB()
      .doc('data/goals')
      .set({ goals, updatedAt: new Date().toISOString() })
    console.log('✅ [FIRESTORE] Goals saved successfully!')
    return true
  } catch (error) {
    console.error('❌ [FIRESTORE] Error setting goals:', error)
    console.error('❌ [FIRESTORE] Error stack:', error.stack)
    throw error
  }
}

export async function getGoalsData() {
  try {
    console.log('📥 [FIRESTORE] Getting goals data...')
    const snapshot = await getDB().doc('data/goals').get()

    if (!snapshot.exists) {
      console.log('⚠️ [FIRESTORE] No goals document found, returning empty array')
      return []
    }

    const data = snapshot.data().goals || []
    console.log('✅ [FIRESTORE] Got goals, count:', data.length)
    return data
  } catch (error) {
    console.error('❌ [FIRESTORE] Error getting goals data:', error)
    console.error('❌ [FIRESTORE] Error stack:', error.stack)
    return []
  }
}

export async function deleteGoals() {
  try {
    await getDB().doc('data/goals').delete()
    return true
  } catch (error) {
    console.error('Error deleting goals:', error)
    throw error
  }
}
