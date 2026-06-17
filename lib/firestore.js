import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA6kTZ0TOpNTuIR5x3YjjMGPtXcZhG_ipU",
  authDomain: "nigs-commitment.firebaseapp.com",
  projectId: "nigs-commitment",
  storageBucket: "nigs-commitment.firebasestorage.app",
  messagingSenderId: "860356210320",
  appId: "1:860356210320:web:e37a39d9adf6e2ac1f7215"
}

// Initialize Firebase (only once)
let app
let db

function initFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
  return db
}

// Get Firestore database
function getDB() {
  if (!db) {
    initFirebase()
  }
  return db
}

// Goals collection operations
export async function getGoals() {
  try {
    const db = getDB()
    const goalsCol = collection(db, 'goals')
    const snapshot = await getDocs(goalsCol)
    
    if (snapshot.empty) {
      return []
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting goals:', error)
    return []
  }
}

export async function setGoals(goals) {
  try {
    const db = getDB()
    
    // Store as a single document for simplicity (like Redis)
    const goalsDoc = doc(db, 'data', 'goals')
    await setDoc(goalsDoc, { goals, updatedAt: new Date().toISOString() })
    
    return true
  } catch (error) {
    console.error('Error setting goals:', error)
    throw error
  }
}

export async function getGoalsData() {
  try {
    const db = getDB()
    const goalsDoc = doc(db, 'data', 'goals')
    const snapshot = await getDoc(goalsDoc)
    
    if (!snapshot.exists()) {
      return []
    }
    
    return snapshot.data().goals || []
  } catch (error) {
    console.error('Error getting goals data:', error)
    return []
  }
}

export async function deleteGoals() {
  try {
    const db = getDB()
    const goalsDoc = doc(db, 'data', 'goals')
    await deleteDoc(goalsDoc)
    return true
  } catch (error) {
    console.error('Error deleting goals:', error)
    throw error
  }
}
