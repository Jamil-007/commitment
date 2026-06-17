import { createClient } from 'redis'

let redis
let isConnected = false
let connectionFailed = false

async function getRedis() {
  // If connection previously failed, use fallback immediately
  if (connectionFailed) {
    return getFallback()
  }

  if (redis && isConnected) {
    return redis
  }

  if (!process.env.REDIS_URL || process.env.REDIS_URL.trim() === '') {
    return getFallback()
  }

  if (!redis) {
    try {
      redis = createClient({ 
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000  // 5 second timeout
        }
      })
      
      redis.on('error', (err) => {
        console.error('Redis Client Error:', err)
        connectionFailed = true
      })
      
      await redis.connect()
      isConnected = true
      console.log('Redis connected successfully')
    } catch (err) {
      console.error('Failed to connect to Redis:', err)
      connectionFailed = true
      redis = null
      return getFallback()
    }
  }

  return redis
}

function getFallback() {
  console.log('Using in-memory fallback (no Redis)')
  const memoryStore = new Map()
  return {
    get: async (key) => memoryStore.get(key) || null,
    set: async (key, value) => {
      memoryStore.set(key, value)
      return true
    },
    del: async (key) => {
      memoryStore.delete(key)
      return true
    }
  }
}

export { getRedis }
