// check_my_trips_api.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://manas20243159_db_user:Hj2zi6mWNyNQyWta@ac-sqa8bfh-shard-00-00.okbnsfk.mongodb.net:27017,ac-sqa8bfh-shard-00-01.okbnsfk.mongodb.net:27017,ac-sqa8bfh-shard-00-02.okbnsfk.mongodb.net:27017/?ssl=true&replicaSet=atlas-y745md-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: 'tripsetgo' });
  const db = mongoose.connection.db;

  const targetUserId = new mongoose.Types.ObjectId('6a357ea4fa492ac0614b8539');
  console.log(`Searching for trips of UserID: ${targetUserId}...`);

  const trips = await db.collection('trips').find({ userId: targetUserId }).sort({ createdAt: -1 }).toArray();
  console.log(`Found ${trips.length} trips!`);
  
  trips.forEach(t => {
    console.log(`TripID: ${t._id}, Destination: ${t.destination}, Source: ${t.source}, isPublic: ${t.isPublic}, planData: ${t.planData ? 'OK' : 'NULL'}, createdAt: ${t.createdAt}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
