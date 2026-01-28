import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTactic } from "@shared/routes";

export function useTactics(teamId: number) {
  return useQuery({
    queryKey: [api.tactics.listByTeam.path, teamId],
    queryFn: async () => {
      const url = buildUrl(api.tactics.listByTeam.path, { teamId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tactics");
      return api.tactics.listByTeam.responses[200].parse(await res.json());
    },
    enabled: !!teamId,
  });
}

export function useCreateTactic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTactic) => {
      const validated = api.tactics.create.input.parse(data);
      const res = await fetch(api.tactics.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create tactic");
      return api.tactics.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.tactics.listByTeam.path, variables.teamId] 
      });
    },
  });
}
