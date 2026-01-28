import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertEvent } from "@shared/routes";

export function useEvents(teamId: number) {
  return useQuery({
    queryKey: [api.events.listByTeam.path, teamId],
    queryFn: async () => {
      const url = buildUrl(api.events.listByTeam.path, { teamId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      // Ensure dates are parsed as Date objects for calendar
      return api.events.listByTeam.responses[200].parse(data).map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
      }));
    },
    enabled: !!teamId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEvent) => {
      const validated = api.events.create.input.parse(data);
      const res = await fetch(api.events.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create event");
      return api.events.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.events.listByTeam.path, variables.teamId] 
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, teamId }: { id: number; teamId: number }) => {
      const url = buildUrl(api.events.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.events.listByTeam.path, teamId] 
      });
    },
  });
}
