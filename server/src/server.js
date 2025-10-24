
import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import connectDB from './config/database.js'

const BASE_PORT = Number(process.env.PORT) || 5000
const MONGO_URI = process.env.MONGO_URI

connectDB(MONGO_URI)

function start(port, allowRetry = true) {
    const server = app.listen(port, () => {
        console.log(`✓ Server running on http://localhost:${port}`)
    })

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            if (allowRetry && !process.env.PORT) {
                const next = port + 1
                console.warn(`Port ${port} in use. Trying ${next}...`)
                setTimeout(() => start(next, true), 300)
            } else {
                console.error(
                    `Port ${port} in use. Stop the other process or set \`PORT\` to a free port.`
                )
                process.exit(1)
            }
        } else {
            console.error('Server error:', err)
            process.exit(1)
        }
    })
}

start(BASE_PORT)
