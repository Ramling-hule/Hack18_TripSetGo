// check_trips.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://manas20243159_db_user:Hj2zi6mWNyNQyWta@ac-sqa8bfh-shard-00-00.okbnsfk.mongodb.net:27017,ac-sqa8bfh-shard-00-01.okbnsfk.mongodb.net:27017,ac-sqa8bfh-shard-00-02.okbnsfk.mongodb.net:27017/?ssl=true&replicaSet=atlas-y745md-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: 'tripsetgo' });
  console.log('Connected to Database.');

  // Find the user
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log('--- USERS IN DATABASE ---');
  users.forEach(u => {
    console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
  });

  const trips = await db.collection('trips').find({}).toArray();
  console.log('--- TRIPS IN DATABASE ---');
  console.log(`Total Trips: ${trips.length}`);
  trips.forEach(t => {
    console.log(`ID: ${t._id}, UserID: ${t.userId}, Destination: ${t.destination}, Source: ${t.source}, isPublic: ${t.isPublic}, planData: ${t.planData ? 'Has PlanData' : 'NULL'}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
