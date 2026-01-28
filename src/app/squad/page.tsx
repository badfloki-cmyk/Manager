"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Plus,
    Trash2,
    UserPlus,
    Search,
    Filter,
    ChevronRight,
    TrendingUp,
    MapPin,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPlayers, Player } from "@/lib/squad";

export default function SquadPage() {
    const [team, setTeam] = useState<"1. Mannschaft" | "2. Mannschaft">("1. Mannschaft");
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadPlayers = async () => {
            setIsLoading(true);
            try {
                const { players: fetchedPlayers } = await getPlayers(team);
                setPlayers(fetchedPlayers || []);
            } catch (error) {
                console.error("Failed to load players:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPlayers();
    }, [team]);

    const filteredPlayers = players.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Kaderverwaltung</h1>
                    </div>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        <button
                            onClick={() => setTeam("1. Mannschaft")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                team === "1. Mannschaft" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            1. Mannschaft
                        </button>
                        <button
                            onClick={() => setTeam("2. Mannschaft")}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                team === "2. Mannschaft" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            2. Mannschaft
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Spieler suchen (Name, Position...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                    </div>
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-red-600/10">
                        <UserPlus className="w-4 h-4" />
                        Neuer Spieler
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Gesamter Kader</p>
                        <h3 className="text-2xl font-bold">{players.length} Spieler</h3>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Top Torschütze</p>
                        <h3 className="text-2xl font-bold">L. Schmidt (8)</h3>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Nächstes Spiel</p>
                        <h3 className="text-2xl font-bold">Sa. 14:00 Uhr</h3>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-slate-500 text-sm mb-1">Verfügbarkeit</p>
                        <h3 className="text-2xl font-bold text-emerald-400">92%</h3>
                    </div>
                </div>

                {/* Player List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredPlayers.map((player, index) => (
                                <motion.div
                                    key={player._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="group relative bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-red-500/30 hover:bg-slate-800/40 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-bold text-red-500 overflow-hidden">
                                                {player.number}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-snug">
                                                    {player.firstName} <br /> {player.lastName}
                                                </h3>
                                                <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">
                                                    {player.position}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                                            player.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                        )}>
                                            {player.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Tore</p>
                                            <p className="font-bold">{player.stats.goals}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Assists</p>
                                            <p className="font-bold">{player.stats.assists}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Einsätze</p>
                                            <p className="font-bold">{player.stats.appearances}</p>
                                        </div>
                                    </div>

                                    <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredPlayers.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500">Keine Spieler gefunden.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
