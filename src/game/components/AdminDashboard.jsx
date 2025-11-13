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
    if (loading) return <div style={{ color: 'white' }}>Loading admin dashboard...</div>;

    return (
        <div style={{ color: 'white', padding: 20, maxWidth: 1200, margin: '0 auto' }}>
            <h1>Admin Dashboard</h1>

            <section style={{ marginBottom: 40 }}>
                <h2>Users ({users.length})</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid #444' }}>
                        <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Coins</th>
                        <th style={{ textAlign: 'right', padding: 8 }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: 8 }}>{u.username}</td>
                            <td style={{ padding: 8 }}>{u.email}</td>
                            <td style={{ padding: 8 }}>{u.role}</td>
                            <td style={{ padding: 8 }}>{u.coins}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                                <button onClick={() => banUser(u._id)} disabled={u.role === 'banned'}>
                                    {u.role === 'banned' ? 'Banned' : 'Ban'}
                                </button>
                                {' '}
                                <button onClick={() => deleteUser(u._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>All Scores ({scores.length})</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid #444' }}>
                        <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Score</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Coins</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                        <th style={{ textAlign: 'right', padding: 8 }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scores.map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: 8 }}>{s.username}</td>
                            <td style={{ padding: 8 }}>{s.score}</td>
                            <td style={{ padding: 8 }}>{s.coins ?? 0}</td>
                            <td style={{ padding: 8 }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                                <button onClick={() => deleteScore(s._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
