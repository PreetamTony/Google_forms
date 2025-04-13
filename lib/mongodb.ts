import { MongoClient } from 'mongodb';

const username = process.env.MONGODB_USERNAME || 'preetam';
const password = process.env.MONGODB_PASSWORD || 'preetam10';
const cluster = process.env.MONGODB_CLUSTER || 'cluster0.lrqom.mongodb.net';
const dbName = process.env.MONGODB_DB || 'googleforms';

const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=cluster0`;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper function to get database
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(dbName);
}

// Helper function to get a collection
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}