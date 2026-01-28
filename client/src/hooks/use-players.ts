import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPlayer } from "@shared/routes";

export function usePlayers(teamId: number) {
  return useQuery({
    queryKey: [api.players.listByTeam.path, teamId],
    queryFn: async () => {
      const url = buildUrl(api.players.listByTeam.path, { teamId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch players");
      return api.players.listByTeam.responses[200].parse(await res.json());
    },
    enabled: !!teamId,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const validated = api.players.create.input.parse(data);
      const res = await fetch(api.players.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create player");
      return api.players.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      const url = buildUrl(api.players.listByTeam.path, { teamId: variables.teamId });
      queryClient.invalidateQueries({ queryKey: [url] });
      queryClient.invalidateQueries({ queryKey: [api.players.listByTeam.path, variables.teamId] });
    },
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertPlayer>) => {
      const url = buildUrl(api.players.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update player");
      return api.players.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedPlayer) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.players.listByTeam.path, updatedPlayer.teamId] 
      });
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, teamId }: { id: number; teamId: number }) => {
      const url = buildUrl(api.players.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete player");
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.players.listByTeam.path, teamId] 
      });
    },
  });
}
