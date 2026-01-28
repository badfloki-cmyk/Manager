"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Target,
    Users,
    ArrowLeft,
    Medal,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlayers, Player } from "@/lib/squad";

type StatCategory = "goals" | "assists" | "appearances";

export default function StatsPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<StatCategory>("goals");
    const [team, setTeam] = useState<"all" | "1. Mannschaft" | "2. Mannschaft">("all");

    const loadPlayers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { players: fetchedPlayers } = await getPlayers();
            setPlayers(fetchedPlayers || []);
        } catch (error) {
            console.error("Failed to load players:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPlayers();
    }, [loadPlayers]);

    const filteredPlayers = team === "all"
        ? players
        : players.filter(p => p.team === team);

    const sortedPlayers = [...filteredPlayers].sort((a, b) =>
        b.stats[category] - a.stats[category]
    );

    const topThree = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3, 10);

    const teamStats = {
        "1. Mannschaft": players.filter(p => p.team === "1. Mannschaft"),
        "2. Mannschaft": players.filter(p => p.team === "2. Mannschaft"),
    };

    const getTeamTotal = (teamPlayers: Player[], stat: StatCategory) =>
        teamPlayers.reduce((sum, p) => sum + p.stats[stat], 0);

    const categoryLabels: Record<StatCategory, string> = {
        goals: "Tore",
        assists: "Assists",
        appearances: "Einsätze"
    };

    const categoryIcons: Record<StatCategory, typeof Trophy> = {
        goals: Target,
        assists: TrendingUp,
        appearances: Users
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo.jpg" alt="Logo" width={100} height={25} className="h-8 w-auto object-contain rounded shadow-sm" />
                        <h1 className="text-2xl font-black text-brand tracking-tight flex items-center gap-3">
                            <Trophy className="w-6 h-6" />
                            Statistiken
                        </h1>
                    </div>
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-inner">
                        {["all", "1. Mannschaft", "2. Mannschaft"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTeam(t as typeof team)}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                    team === t ? "bg-brand text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {t === "all" ? "Alle" : t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Category Tabs */}
                <div className="flex gap-4 mb-12">
                    {(Object.keys(categoryLabels) as StatCategory[]).map((cat) => {
                        const Icon = categoryIcons[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                    category === cat
                                        ? "bg-brand text-white shadow-xl shadow-brand/20"
                                        : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-brand"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {categoryLabels[cat]}
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-3 gap-8 mb-20">
                            {[1, 0, 2].map((idx) => {
                                const player = topThree[idx];
                                if (!player) return <div key={idx} />;

                                const position = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                                const heights = { 1: "h-56", 2: "h-44", 3: "h-36" };
                                const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

                                return (
                                    <motion.div
                                        key={player._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="relative mb-6">
                                            <div className={cn(
                                                "w-28 h-28 rounded-[2.5rem] border-4 flex items-center justify-center overflow-hidden shadow-2xl transition-transform hover:scale-105",
                                                position === 1 ? "border-yellow-400 shadow-yellow-500/10" : position === 2 ? "border-slate-300 shadow-slate-500/10" : "border-amber-600 shadow-amber-800/10"
                                            )}>
                                                {player.photoUrl ? (
                                                    <Image
                                                        src={player.photoUrl}
                                                        alt={`${player.firstName} ${player.lastName}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-black text-slate-300">{player.number}</span>
                                                )}
                                            </div>
                                            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-md">
                                                {medals[position as 1 | 2 | 3]}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-slate-900 text-lg tracking-tight text-center">
                                            {player.firstName} {player.lastName}
                                        </h3>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mt-1">{player.position}</p>
                                        <div className={cn(
                                            "mt-6 w-full rounded-[2.5rem] flex flex-col items-center justify-center gap-1 border-x border-t border-slate-100 shadow-inner",
                                            position === 1 ? "bg-gradient-to-t from-yellow-50 to-white" :
                                                position === 2 ? "bg-gradient-to-t from-slate-50 to-white" :
                                                    "bg-gradient-to-t from-amber-50 to-white",
                                            heights[position as 1 | 2 | 3]
                                        )}>
                                            <span className="text-5xl font-black text-slate-900 tracking-tighter">{player.stats[category]}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{categoryLabels[category]}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Rest of Leaderboard */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden mb-20 shadow-xl shadow-slate-200/50 min-h-[400px]">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4">
                                    <Medal className="w-5 h-5 text-brand" />
                                    Leaderboard
                                </h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{categoryLabels[category]}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {rest.map((player, idx) => (
                                    <motion.div
                                        key={player._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="w-10 h-10 flex items-center justify-center bg-slate-50 group-hover:bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-400 group-hover:text-brand transition-colors">
                                                {idx + 4}
                                            </span>
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                                                {player.photoUrl ? (
                                                    <Image
                                                        src={player.photoUrl}
                                                        alt={`${player.firstName} ${player.lastName}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-black text-slate-300">{player.number}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 tracking-tight">{player.firstName} {player.lastName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{player.team}</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{player.stats[category]}</span>
                                    </motion.div>
                                ))}
                                {rest.length === 0 && (
                                    <div className="p-16 text-center text-slate-300">
                                        <p className="font-black uppercase text-[10px] tracking-widest">Keine weiteren Spieler vorhanden.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Comparison */}
                        <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-4 mb-10">
                            <span className="bg-slate-100 h-px flex-1" />
                            Team-Vergleich
                            <span className="bg-slate-100 h-px flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {(["1. Mannschaft", "2. Mannschaft"] as const).map((teamName) => (
                                <div key={teamName} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                    <h4 className="text-2xl font-black text-brand tracking-tight mb-8">{teamName}</h4>
                                    <div className="grid grid-cols-3 gap-6 relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter">
                                                {getTeamTotal(teamStats[teamName], "goals")}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Tore</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter">
                                                {getTeamTotal(teamStats[teamName], "assists")}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Assists</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter">
                                                {teamStats[teamName].length}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Spieler</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
