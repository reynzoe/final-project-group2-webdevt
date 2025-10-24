import mongoose from 'mongoose'

export default async function connectDB(uri) {
    if (!uri) {
        console.warn('MONGO_URI not set, skipping MongoDB connection')
        return
    }
    try {
        await mongoose.connect(uri)
        console.log('✓ MongoDB connected')
    } catch (err) {
        console.error('✗ MongoDB connection failed:', err.message)
    }
}
