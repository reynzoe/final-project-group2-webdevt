import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

export default function AdminDashboard() {
    const { user, token } = useGame();
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

    useEffect(() => {
        if (user?.role === 'admin' && token) {
            fetchData();
        }
    }, [user, token]);

    async function fetchData() {
        try {
            const [usersRes, scoresRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/admin/scores`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const usersData = await usersRes.json();
            const scoresData = await scoresRes.json();

            setUsers(usersData);
            setScores(scoresData);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteUser(id) {
        if (!confirm('Delete this user and all their scores?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(users.filter((u) => u._id !== id));
                setScores(scores.filter((s) => s.username !== users.find((u) => u._id === id)?.username));
            }
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    }

    async function banUser(id) {
        if (!confirm('Ban this user?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}/ban`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(users.map((u) => (u._id === id ? { ...u, role: 'banned' } : u)));
            }
        } catch (err) {
            console.error('Failed to ban user:', err);
        }
    }

    async function deleteScore(id) {
        if (!confirm('Delete this score?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/scores/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setScores(scores.filter((s) => s._id !== id));
            }
        } catch (err) {
            console.error('Failed to delete score:', err);
        }
    }

    if (user?.role !== 'admin') return null;
    if (loading) return <div style={{ color: 'white', padding: '40px 20px' }}>Loading admin dashboard...</div>;

    return (
        <div style={{
            color: 'white',
            padding: '40px 20px 20px 20px',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            marginTop: '20px'
        }}>
            <h1 style={{ marginBottom: '30px', fontSize: '24px' }}>Admin Dashboard</h1>

            <section style={{
                marginBottom: '40px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '20px',
                borderRadius: '8px'
            }}>
                <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Users ({users.length})</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #555' }}>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Username</th>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Role</th>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Coins</th>
                            <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 'bold' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '12px 8px' }}>{u.username}</td>
                                <td style={{ padding: '12px 8px' }}>{u.email}</td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: u.role === 'admin' ? '#4a5568' : u.role === 'banned' ? '#742a2a' : '#2d3748',
                                        fontSize: '12px'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px' }}>{u.coins}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => banUser(u._id)}
                                        disabled={u.role === 'banned'}
                                        style={{
                                            padding: '6px 12px',
                                            marginRight: '8px',
                                            cursor: u.role === 'banned' ? 'not-allowed' : 'pointer',
                                            opacity: u.role === 'banned' ? 0.5 : 1,
                                            backgroundColor: '#d69e2e',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white'
                                        }}
                                    >
                                        {u.role === 'banned' ? 'Banned' : 'Ban'}
                                    </button>
                                    <button
                                        onClick={() => deleteUser(u._id)}
                                        style={{
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            backgroundColor: '#c53030',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '20px',
                borderRadius: '8px'
            }}>
                <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>All Scores ({scores.length})</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #555' }}>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Username</th>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Score</th>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Coins</th>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 'bold' }}>Date</th>
                            <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 'bold' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scores.map((s) => (
                            <tr key={s._id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '12px 8px' }}>{s.username}</td>
                                <td style={{ padding: '12px 8px' }}>{s.score}</td>
                                <td style={{ padding: '12px 8px' }}>{s.coins ?? 0}</td>
                                <td style={{ padding: '12px 8px' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => deleteScore(s._id)}
                                        style={{
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            backgroundColor: '#c53030',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}