// check_user_id.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://manas20243159_db_user:Hj2zi6mWNyNQyWta@ac-sqa8bfh-shard-00-00.okbnsfk.mongodb.net:27017,ac-sqa8bfh-shard-00-01.okbnsfk.mongodb.net:27017,ac-sqa8bfh-shard-00-02.okbnsfk.mongodb.net:27017/?ssl=true&replicaSet=atlas-y745md-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: 'tripsetgo' });
  const db = mongoose.connection.db;
  
  const shouryas = await db.collection('users').find({ name: /shourya/i }).toArray();
  console.log('--- SHOURYA USERS ---');
  shouryas.forEach(u => {
    console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`);
  });

  const tripUserIds = await db.collection('trips').distinct('userId');
  console.log('--- USER IDS WITH TRIPS ---');
  console.log(tripUserIds);

  await mongoose.disconnect();
}

run().catch(console.error);
