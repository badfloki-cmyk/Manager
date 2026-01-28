import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTeams } from "@/hooks/use-teams";
import { usePlayers } from "@/hooks/use-players";
import { useEvents } from "@/hooks/use-events";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { TeamSelector } from "@/components/TeamSelector";
import { Users, Calendar, Trophy, Activity, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  useEffect(() => {
    if (teams?.length && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const { data: players } = usePlayers(selectedTeamId || 0);
  const { data: events } = useEvents(selectedTeamId || 0);

  if (loadingTeams) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const activePlayers = players?.filter(p => p.status === "Active")?.length || 0;
  const injuredPlayers = players?.filter(p => p.status === "Injured")?.length || 0;
  const nextEvent = events?.filter(e => new Date(e.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
  
  const totalGoals = players?.reduce((sum, p) => sum + (p.stats?.goals || 0), 0) || 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.firstName}</h2>
              <p className="text-muted-foreground">Here's what's happening with your squad.</p>
            </div>
            
            {teams && (
              <TeamSelector 
                teams={teams} 
                selectedTeamId={selectedTeamId} 
                onSelect={setSelectedTeamId} 
              />
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Active Squad" 
              value={activePlayers} 
              icon={Users} 
              trend={injuredPlayers > 0 ? `${injuredPlayers} Injured` : "Full Strength"}
              trendUp={injuredPlayers === 0}
            />
            <StatCard 
              title="Season Goals" 
              value={totalGoals} 
              icon={Trophy}
              trend="+12 vs Last Month"
              trendUp={true}
            />
            <StatCard 
              title="Upcoming Match" 
              value={nextEvent ? format(new Date(nextEvent.start), "MMM d") : "None"} 
              icon={Calendar}
              trend={nextEvent?.opponent || "No Opponent"}
              trendUp={true}
            />
            <StatCard 
              title="Training Attendance" 
              value="94%" 
              icon={Activity}
              trend="+2% This Week"
              trendUp={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Upcoming Schedule</h3>
                  <button className="text-xs text-primary font-medium hover:underline uppercase tracking-wider">View All</button>
                </div>
                <div className="space-y-4">
                  {events?.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors group">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-black/40 border border-white/10 text-center">
                        <span className="text-xs text-muted-foreground uppercase font-bold">{format(new Date(event.start), "MMM")}</span>
                        <span className="text-xl font-bold text-white font-display">{format(new Date(event.start), "d")}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{event.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className={event.type === 'match' ? 'text-primary' : ''}>{event.type.toUpperCase()}</span>
                          <span>•</span>
                          <span>{format(new Date(event.start), "HH:mm")}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {event.opponent && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground uppercase">Opponent</p>
                          <p className="font-semibold text-white">{event.opponent}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {!events?.length && (
                    <div className="text-center py-8 text-muted-foreground">No upcoming events scheduled.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Top Scorers</h3>
                <div className="space-y-4">
                  {players?.sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0)).slice(0, 5).map((player, i) => (
                    <div key={player.id} className="flex items-center gap-4">
                      <div className="w-6 text-center text-muted-foreground font-mono text-sm">{i + 1}</div>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {player.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                      </div>
                      <div className="font-bold text-white">{player.stats?.goals || 0}</div>
                    </div>
                  ))}
                  {!players?.length && (
                    <div className="text-center py-4 text-muted-foreground">No stats available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
