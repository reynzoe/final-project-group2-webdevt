import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import '../../styles/shop.css';

const COLORS = [
    { name: 'red', hex: '#FF0000', price: 10000 },
    { name: 'orange', hex: '#FFA500', price: 10000 },
    { name: 'yellow', hex: '#FFFF00', price: 10000 },
    { name: 'green', hex: '#00FF00', price: 10000 },
    { name: 'blue', hex: '#0000FF', price: 10000 },
    { name: 'indigo', hex: '#4B0082', price: 10000 },
    { name: 'violet', hex: '#8B00FF', price: 10000 }
];

export default function Shop({ onClose }) {
    const { user, purchaseProjectileColor, equipProjectileColor } = useGame();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handlePurchase(color) {
        try {
            setError('');
            setSuccess('');
            await purchaseProjectileColor(color);
            setSuccess(`Successfully purchased ${color}!`);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleEquip(color) {
        try {
            setError('');
            setSuccess('');
            await equipProjectileColor(color);
            setSuccess(`Equipped ${color}!`);
        } catch (err) {
            setError(err.message);
        }
    }

    const ownedColors = user?.projectile?.ownedColors || ['lightblue'];
    const equippedColor = user?.projectile?.equippedColor || 'lightblue';

    return (
        <div className="shop-overlay" onClick={onClose}>
            <div className="shop-container" onClick={(e) => e.stopPropagation()}>
                <div className="shop-header">
                    <h2>Projectile Shop</h2>
                    <button className="shop-close" onClick={onClose}>✕</button>
                </div>

                <div className="shop-coins">
                    💰 Coins: {user?.coins || 0}
                </div>

                {error && <div className="shop-error">{error}</div>}
                {success && <div className="shop-success">{success}</div>}

                <div className="shop-grid">
                    {COLORS.map((color) => {
                        const owned = ownedColors.includes(color.name);
                        const equipped = equippedColor === color.name;

                        return (
                            <div key={color.name} className="shop-item">
                                <div
                                    className="shop-color-preview"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <div className="shop-item-name">{color.name}</div>
                                <div className="shop-item-price">{color.price} coins</div>

                                {equipped ? (
                                    <button className="shop-button equipped" disabled>
                                        ✓ Equipped
                                    </button>
                                ) : owned ? (
                                    <button
                                        className="shop-button equip"
                                        onClick={() => handleEquip(color.name)}
                                    >
                                        Equip
                                    </button>
                                ) : (
                                    <button
                                        className="shop-button purchase"
                                        onClick={() => handlePurchase(color.name)}
                                        disabled={(user?.coins || 0) < color.price}
                                    >
                                        Purchase
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
