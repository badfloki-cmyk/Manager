"use strict";
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Activity,
    Trophy,
    Target,
    Footprints,
    Search,
    ArrowLeft,
    Pencil,
    Check,
    X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers, updatePlayer, Player } from "@/lib/squad";

export default function StatsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    const [players, setPlayers] = useState<Player[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [teamFilter, setTeamFilter] = useState<"All" | "1. Mannschaft" | "2. Mannschaft">("All");

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStats, setEditStats] = useState({
        goals: 0,
        assists: 0,
        appearances: 0
    });

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const { players } = await getPlayers();
            setPlayers(players || []);
        } catch (error) {
            console.error("Failed to fetch players", error);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (player: Player) => {
        setEditingId(player._id);
        setEditStats({
            goals: player.stats?.goals || 0,
            assists: player.stats?.assists || 0,
            appearances: player.stats?.appearances || 0
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveStats = async (playerId: string) => {
        try {
            // Optimistic update
            setPlayers(prev => prev.map(p =>
                p._id === playerId ? { ...p, stats: editStats } : p
            ));

            await updatePlayer(playerId, { stats: editStats });
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update stats", error);
            fetchPlayers(); // Revert on error
        }
    };

    const filteredPlayers = players.filter(player => {
        const matchesSearch =
            player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.lastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = teamFilter === "All" || player.team === teamFilter;
        return matchesSearch && matchesTeam;
    }).sort((a, b) => {
        // Sort by goals desc, then assists desc
        const goalsA = a.stats?.goals || 0;
        const goalsB = b.stats?.goals || 0;
        if (goalsA !== goalsB) return goalsB - goalsA;
        return (b.stats?.assists || 0) - (a.stats?.assists || 0);
    });

    const topScorer = [...players].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0];
    const topAssister = [...players].sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0))[0];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand/10 selection:text-brand">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900 group">
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <Image src="/logo_new.png" alt="Logo" width={100} height={32} className="h-10 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-2xl font-black text-brand tracking-tight hidden sm:block">
                            Statistiken
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">

                {/* Highlights */}
                <div className="grid md:grid-cols-2 gap-6">
                    {topScorer && (
                        <div className="bg-gradient-to-br from-brand to-brand-dark rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">Top Scorer</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-brand font-black text-2xl shadow-inner">
                                        {topScorer.stats?.goals || 0}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{topScorer.firstName} {topScorer.lastName}</h3>
                                        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{topScorer.position}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {topAssister && (
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Activity className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">Top Vorbereiter</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 font-black text-2xl shadow-inner border border-slate-700">
                                        {topAssister.stats?.assists || 0}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{topAssister.firstName} {topAssister.lastName}</h3>
                                        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{topAssister.position}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center sticky top-24 z-30 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                        <input
                            type="text"
                            placeholder="Spieler suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-brand/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:bg-white transition-all font-medium placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex bg-slate-50 rounded-2xl p-1.5 gap-1 w-full md:w-auto shadow-inner">
                        {(["All", "1. Mannschaft", "2. Mannschaft"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTeamFilter(t)}
                                className={cn(
                                    "flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    teamFilter === t
                                        ? "bg-white text-brand shadow-lg shadow-slate-200"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                            >
                                {t === "All" ? "Alle" : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Spieler</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-brand uppercase tracking-widest w-32">
                                        <div className="flex flex-col items-center gap-1">
                                            <Target className="w-4 h-4" /> Tore
                                        </div>
                                    </th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-blue-500 uppercase tracking-widest w-32">
                                        <div className="flex flex-col items-center gap-1">
                                            <Activity className="w-4 h-4" /> Vorlagen
                                        </div>
                                    </th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">
                                        <div className="flex flex-col items-center gap-1">
                                            <Footprints className="w-4 h-4" /> Spiele
                                        </div>
                                    </th>
                                    {isAdmin && <th className="px-8 py-6 w-20"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={isAdmin ? 5 : 4} className="p-12 text-center text-slate-400">Lade Statistiken...</td></tr>
                                ) : filteredPlayers.length === 0 ? (
                                    <tr><td colSpan={isAdmin ? 5 : 4} className="p-12 text-center text-slate-400">Keine Spieler gefunden.</td></tr>
                                ) : (
                                    filteredPlayers.map((player) => (
                                        <tr key={player._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-md",
                                                        player.position === "Torwart" ? "bg-yellow-500 shadow-yellow-500/20" : "bg-brand shadow-brand/20"
                                                    )}>
                                                        {player.number}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-lg text-slate-900 tracking-tight">
                                                            {player.firstName} {player.lastName}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                            <span>{player.position}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{player.team}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Data Columns */}
                                            {editingId === player._id ? (
                                                <>
                                                    <td className="px-4 py-6 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editStats.goals}
                                                            onChange={(e) => setEditStats({ ...editStats, goals: parseInt(e.target.value) || 0 })}
                                                            className="w-20 bg-brand/5 border border-brand/20 text-brand font-black text-xl text-center rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-6 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editStats.assists}
                                                            onChange={(e) => setEditStats({ ...editStats, assists: parseInt(e.target.value) || 0 })}
                                                            className="w-20 bg-blue-50 border border-blue-200 text-blue-600 font-black text-xl text-center rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-6 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editStats.appearances}
                                                            onChange={(e) => setEditStats({ ...editStats, appearances: parseInt(e.target.value) || 0 })}
                                                            className="w-20 bg-slate-100 border border-slate-200 text-slate-600 font-black text-xl text-center rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                                        />
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => saveStats(player._id)}
                                                                className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-2xl font-black text-brand tracking-tight">
                                                            {player.stats?.goals || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-2xl font-black text-blue-500 tracking-tight">
                                                            {player.stats?.assists || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-2xl font-black text-slate-400 tracking-tight">
                                                            {player.stats?.appearances || 0}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => startEditing(player)}
                                                                className="p-3 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-brand transition-colors"
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    )}
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
