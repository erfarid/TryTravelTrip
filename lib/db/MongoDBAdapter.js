import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./MongoDBClient";

const adapter = clientPromise ? MongoDBAdapter(clientPromise) : null;

export default adapter;
