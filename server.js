const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')

const app = express()
app.use(cors())
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI

app.use(express.json())

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB')
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error)
})

// Define the User schema
const userSchema = new mongoose.Schema({
  type: { type: String, enum: ['friend', 'member', 'admin'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  payments: [{
    from: { type: Number, ref: 'User' },
    to: { type: Number, ref: 'User' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    walletAddress: { type: String },
    dueDate: { type: Date }
  }],
  tasks: [{
    owner: { type: Number, ref: 'User' },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true }
  }],
  projects: [{
    owners: [{ type: Number, ref: 'User' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    dueDate: { type: Date },
    progress: { type: Number },
    budget: { type: Number }
  }],
  events: [{
    date: { type: Date, required: true },
    organizer: { type: Number, ref: 'User', required: true },
    suggestedBy: { type: Number, ref: 'User' },
    description: { type: String, required: true },
    price: { type: Number, required: true }
  }]
})

// Define the Payment schema
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'cash', 'transfer', 'crypto'], required: true },
  currency: { type: String, enum: ['USD', 'EUR', 'BTC', 'ETH', 'USDC'], required: true }
})

// Define the Task schema
const taskSchema = new mongoose.Schema({
  owner: { type: Number, ref: 'User', required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true }
})

// Define the Project schema
const projectSchema = new mongoose.Schema({
  owners: [{ type: Number, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  dueDate: { type: Date, required: true },
  progress: { type: Number, required: true },
  budget: { type: Number, required: true }
})

// Define the Event schema
const eventSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  organizer: { type: Number, ref: 'User', required: true },
  suggestedBy: { type: Number, ref: 'User' },
  description: { type: String, required: true },
  price: { type: Number, required: true }
})

// Create Mongoose models
const User = mongoose.model('User', userSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const Task = mongoose.model('Task', taskSchema)
const Project = mongoose.model('Project', projectSchema)
const Event = mongoose.model('Event', eventSchema)

// CRUD Routes for Users (example)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
    console.log(users)
    res.json(users)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()
    res.status(201).json(user)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(user)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).end()
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
