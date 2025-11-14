import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { User } from '../models/index.js'

const router = Router()
const PRICES = {
    red: 10000,
    orange: 10000,
    yellow: 10000,
    green: 10000,
    blue: 10000,
    indigo: 10000,
    violet: 10000
}

router.post('/shop/projectile-color/purchase', authenticate, async (req, res) => {
    try {
        const { color } = req.body
        if (!PRICES[color]) return res.status(400).json({ error: 'Color not available' })

        const user = await User.findById(req.user.userId)
        if (!user) return res.status(404).json({ error: 'User not found' })

        if (user.projectile.ownedColors.includes(color))
            return res.status(400).json({ error: 'Already owned' })

        if (user.coins < PRICES[color])
            return res.status(400).json({ error: 'Not enough coins' })

        user.coins -= PRICES[color]
        user.projectile.ownedColors.push(color)
        await user.save()
        res.json({ message: 'Purchased', coins: user.coins, ownedColors: user.projectile.ownedColors })
    } catch {
        res.status(500).json({ error: 'Purchase failed' })
    }
})

router.post('/shop/projectile-color/equip', authenticate, async (req, res) => {
    try {
        const { color } = req.body
        const user = await User.findById(req.user.userId)
        if (!user) return res.status(404).json({ error: 'User not found' })
        if (!user.projectile.ownedColors.includes(color))
            return res.status(400).json({ error: 'Color not owned' })

        user.projectile.equippedColor = color
        await user.save()
        res.json({ message: 'Equipped', equippedColor: color })
    } catch {
        res.status(500).json({ error: 'Equip failed' })
    }
})

export default router
