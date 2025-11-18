import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/70 grid place-items-center z-50" onClick={onCancel}>
            <div className="w-[400px] bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-cyan-300 mb-4">Confirm Action</h3>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-white font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 border border-red-500/50 rounded text-white font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { user, token } = useGame();
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState(null);
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

            if (usersRes.ok) setUsers(await usersRes.json());
            if (scoresRes.ok) setScores(await scoresRes.json());
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    }

    function showConfirm(message, onConfirm) {
        setConfirmDialog({
            message,
            onConfirm: () => {
                setConfirmDialog(null);
                onConfirm();
            },
            onCancel: () => setConfirmDialog(null)
        });
    }

    async function deleteUser(id) {
        showConfirm('Delete this user and all their scores?', async () => {
            try {
                const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) fetchData();
            } catch (err) {
                console.error('Delete user failed:', err);
            }
        });
    }

    async function banUser(id) {
        showConfirm('Ban this user?', async () => {
            try {
                const res = await fetch(`${API_BASE}/api/admin/users/${id}/ban`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) fetchData();
            } catch (err) {
                console.error('Ban user failed:', err);
            }
        });
    }

    async function unbanUser(id) {
        showConfirm('Unban this user?', async () => {
            try {
                const res = await fetch(`${API_BASE}/api/admin/users/${id}/unban`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) fetchData();
            } catch (err) {
                console.error('Unban user failed:', err);
            }
        });
    }

    async function deleteScore(id) {
        showConfirm('Delete this score?', async () => {
            try {
                const res = await fetch(`${API_BASE}/api/admin/scores/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) fetchData();
            } catch (err) {
                console.error('Delete score failed:', err);
            }
        });
    }

    if (user?.role !== 'admin') return null;
    if (loading) return <div className="text-cyan-300 p-4 font-mono">Loading Imperial Command Center...</div>;

    return (
        <>
            <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
                {/* Users Section */}
                <section className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_30px_rgba(6,182,212,0.15),inset_0_0_30px_rgba(6,182,212,0.05)]">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-cyan-500/30">
                        <span className="text-2xl">👥</span>
                        <h2 className="text-xl font-bold text-cyan-300 tracking-wider uppercase">Personnel Roster</h2>
                    </div>
                    <div className="space-y-3">
                        {users.map((u) => (
                            <div key={u._id} className="bg-slate-800/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-400/40 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="text-cyan-300 font-bold text-lg tracking-wide">{u.username}</div>
                                        <div className="text-cyan-100/60 text-sm">{u.email}</div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                                                    u.role === 'banned' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                                                        'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                                            }`}>
                                                {u.role}
                                            </span>
                                            <span className="text-amber-300/90 text-sm font-semibold">{u.coins || 0} ◈</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {u.role === 'banned' ? (
                                            <button
                                                onClick={() => unbanUser(u._id)}
                                                className="px-4 py-2 bg-emerald-700/50 hover:bg-emerald-600/50 border border-emerald-500/30 hover:border-emerald-400/50 rounded text-emerald-300 hover:text-emerald-200 text-xs uppercase font-bold tracking-wider transition-all duration-300"
                                            >
                                                Unban
                                            </button>
                                        ) : u.role !== 'admin' && (
                                            <button
                                                onClick={() => banUser(u._id)}
                                                className="px-4 py-2 bg-amber-700/50 hover:bg-amber-600/50 border border-amber-500/30 hover:border-amber-400/50 rounded text-amber-300 hover:text-amber-200 text-xs uppercase font-bold tracking-wider transition-all duration-300"
                                            >
                                                Ban
                                            </button>
                                        )}
                                        {u.username !== user.username && (
                                            <button
                                                onClick={() => deleteUser(u._id)}
                                                className="px-4 py-2 bg-slate-700/50 hover:bg-rose-500/20 border border-cyan-500/30 hover:border-rose-400/50 rounded text-cyan-300 hover:text-rose-300 text-xs uppercase font-bold tracking-wider transition-all duration-300"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Scores Section */}
                <section className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_30px_rgba(6,182,212,0.15),inset_0_0_30px_rgba(6,182,212,0.05)]">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-cyan-500/30">
                        <span className="text-2xl">🏆</span>
                        <h2 className="text-xl font-bold text-cyan-300 tracking-wider uppercase">Combat Records</h2>
                    </div>
                    <div className="space-y-3">
                        {scores.map((s) => (
                            <div key={s._id} className="bg-slate-800/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-400/40 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex-1">
                                        <div className="text-cyan-300 font-bold text-lg tracking-wide">{s.username}</div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-emerald-300 text-xl font-bold tracking-wide" style={{ textShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                                                {s.score.toLocaleString()} pts
                                            </span>
                                            <span className="text-amber-300/90 text-sm font-semibold">{s.coins ?? 0} ◈</span>
                                            <span className="text-cyan-100/60 text-sm">{new Date(s.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteScore(s._id)}
                                        className="px-4 py-2 bg-slate-700/50 hover:bg-rose-500/20 border border-cyan-500/30 hover:border-rose-400/50 rounded text-cyan-300 hover:text-rose-300 text-xs uppercase font-bold tracking-wider transition-all duration-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {confirmDialog && (
                <ConfirmModal
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </>
    );
}
