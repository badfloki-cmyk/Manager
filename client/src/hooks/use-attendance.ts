import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAttendance } from "@shared/routes";

export function useEventAttendance(eventId: number) {
  return useQuery({
    queryKey: [api.attendance.getByEvent.path, eventId],
    queryFn: async () => {
      const url = buildUrl(api.attendance.getByEvent.path, { eventId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.getByEvent.responses[200].parse(await res.json());
    },
    enabled: !!eventId,
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAttendance) => {
      const validated = api.attendance.update.input.parse(data);
      const res = await fetch(api.attendance.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update attendance");
      return api.attendance.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.attendance.getByEvent.path, variables.eventId] 
      });
    },
  });
}
