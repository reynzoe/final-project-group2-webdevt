// File: src/game/contexts/GameContext.jsx
import React, { createContext, useContext, useState } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
    const [player, setPlayer] = useState(null) // { name, role }
    const [started, setStarted] = useState(false)

    function startGame({ name, role }) {
        setPlayer({ name, role })
        setStarted(true)
        console.log('Game started for', name, 'role:', role)
    }

    function resetGame() {
        setPlayer(null)
        setStarted(false)
    }

    return (
        <GameContext.Provider value={{ player, started, startGame, resetGame }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const ctx = useContext(GameContext)
    if (!ctx) throw new Error('useGame must be used inside GameProvider')
    return ctx
}
