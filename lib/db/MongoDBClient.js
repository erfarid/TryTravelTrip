// MongoDB client used by the Auth.js adapter.
// Creating the client is safe during `next build`; the driver connects lazily
// when a database operation is actually executed.
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let clientPromise = null;

if (uri) {
  let client;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, options);
    }
    client = global._mongoClient;
  } else {
    client = new MongoClient(uri, options);
  }

  // Do not connect at module-import time. This prevents Vercel's build step
  // from failing simply because the database is unavailable during the build.
  clientPromise = Promise.resolve(client);
}

export default clientPromise;
