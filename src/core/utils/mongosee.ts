/* eslint-disable no-console */
import { connect, connection } from 'mongoose';

interface ConnectionState {
  isConnected: boolean;
}

const conn: ConnectionState = {
  isConnected: false,
};

export async function dbConnect(): Promise<void> {
  if (conn.isConnected) return;

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  const db = await connect(mongoUrl);
  conn.isConnected = db.connections[0].readyState === 1;
}

connection.on('connected', () => {
  console.log('Mongodb is connected');
});

connection.on('error', (err: Error) => {
  console.error('MongoDB connection error:', err);
});
