import { cn } from "@/lib/utils";
import type { Team } from "@shared/schema";

interface TeamSelectorProps {
  teams: Team[];
  selectedTeamId: number | null;
  onSelect: (id: number) => void;
}

export function TeamSelector({ teams, selectedTeamId, onSelect }: TeamSelectorProps) {
  if (!teams.length) return null;

  return (
    <div className="flex bg-black/20 p-1 rounded-xl mb-8 w-fit border border-white/5">
      {teams.map((team) => (
        <button
          key={team.id}
          onClick={() => onSelect(team.id)}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            selectedTeamId === team.id
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
        >
          {team.name}
        </button>
      ))}
    </div>
  );
}
