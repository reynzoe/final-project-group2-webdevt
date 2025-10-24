// server/src/app.js
import express from 'express'
import cors from 'cors'
import testRouter from './routes/test.js'

const app = express()

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())

app.get('/', (_req, res) => {
    res.type('text').send('API is running. Try /health or /api/test')
})

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', pid: process.pid, timestamp: new Date() })
})

app.use('/api/test', testRouter)

export default app