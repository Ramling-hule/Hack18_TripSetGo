// server/src/scripts/promote.js
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User.model')

const email = process.argv[2]
if (!email) {
  console.log('❌ Please provide an email address. Usage: npm run promote -- your_email@example.com')
  process.exit(1)
}

mongoose.connect(process.env.MONGODB_URI, { dbName: 'tripsetgo' }).then(async () => {
  console.log(`Connecting to database and locating user: ${email}...`)
  
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    console.log(`❌ User not found with email: ${email}`)
    mongoose.disconnect()
    process.exit(1)
  }

  user.role = 'admin'
  await user.save()

  console.log(`✅ Success! User "${user.name}" (${user.email}) is now promoted to "${user.role}"`)
  
  mongoose.disconnect()
  process.exit(0)
}).catch(err => {
  console.error('❌ Mongoose connection failed:', err.message)
  process.exit(1)
})
