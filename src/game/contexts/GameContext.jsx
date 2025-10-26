// src/game/contexts/GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
    const [player, setPlayer] = useState(null)
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

    const value = { player, started, startGame, resetGame }

    useEffect(() => {
        window.__gameContext = value
    }, [value])

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
    const ctx = useContext(GameContext)
    if (!ctx) throw new Error('useGame must be used inside GameProvider')
    return ctx
}
