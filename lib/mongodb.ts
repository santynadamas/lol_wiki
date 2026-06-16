import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error('Define MONGODB_URI en .env.local')

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  clientPromise = new MongoClient(uri).connect()
}

export default clientPromise

export function getDb() {
  return clientPromise.then(client => client.db(process.env.MONGODB_DB || 'ward'))
}
