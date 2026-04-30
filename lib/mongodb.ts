import mongoose from 'mongoose'
import dns from 'dns'

// Prefer IPv4 for SRV lookups and set reliable public DNS to avoid local resolver issues
try {
  dns.setDefaultResultOrder('ipv4first')
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (_) {
  // Safe to ignore in environments without these APIs
}

const MONGODB_URI = process.env.MONGODB_URI!
const LOCAL_FALLBACK_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/medical-chatbot'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: any
    promise: Promise<any> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connect(uri: string) {
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 12000,
    family: 4,
  } as any
  return mongoose.connect(uri, opts)
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        return await connect(MONGODB_URI)
      } catch (err: any) {
        const message = String(err?.message || err)
        const isSrvDnsIssue = message.includes('querySrv') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')
        if (isSrvDnsIssue) {
          // Attempt local fallback for development if SRV DNS resolution fails
          try {
            return await connect(LOCAL_FALLBACK_URI)
          } catch (fallbackError) {
            throw err // rethrow original SRV error to make root cause visible
          }
        }
        throw err
      }
    })()
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
