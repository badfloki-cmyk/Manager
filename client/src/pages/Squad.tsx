import { useState, useEffect } from "react";
import { useTeams } from "@/hooks/use-teams";
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from "@/hooks/use-players";
import { Sidebar } from "@/components/Sidebar";
import { TeamSelector } from "@/components/TeamSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Shirt, MoreVertical, Edit2, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPlayerSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formSchema = insertPlayerSchema.pick({
  name: true,
  position: true,
  number: true,
  status: true,
});

type PlayerFormValues = z.infer<typeof formSchema>;

export default function Squad() {
  const { data: teams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (teams?.length && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const { data: players, isLoading } = usePlayers(selectedTeamId || 0);
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "MID",
      status: "Active",
    },
  });

  const onSubmit = (data: PlayerFormValues) => {
    if (!selectedTeamId) return;
    
    createPlayer.mutate({
      ...data,
      teamId: selectedTeamId,
      number: Number(data.number) || undefined,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
        toast({ title: "Player added", description: `${data.name} has been added to the squad.` });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!selectedTeamId) return;
    if (confirm("Are you sure you want to remove this player?")) {
      deletePlayer.mutate({ id, teamId: selectedTeamId }, {
        onSuccess: () => toast({ title: "Player removed" }),
      });
    }
  };

  const groupedPlayers = {
    GK: players?.filter(p => p.position === 'GK') || [],
    DEF: players?.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(p.position)) || [],
    MID: players?.filter(p => ['CM', 'CDM', 'CAM', 'LM', 'RM', 'MID'].includes(p.position)) || [],
    FWD: players?.filter(p => ['ST', 'CF', 'LW', 'RW', 'FWD'].includes(p.position)) || [],
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 font-display uppercase tracking-wide">Squad Management</h2>
              <p className="text-muted-foreground">Manage your team roster and player details.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {teams && (
                <TeamSelector 
                  teams={teams} 
                  selectedTeamId={selectedTeamId} 
                  onSelect={setSelectedTeamId} 
                />
              )}
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Player</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Thomas Müller" {...field} className="bg-black/20 border-white/10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-card border-white/10 text-white">
                                  <SelectItem value="GK">Goalkeeper</SelectItem>
                                  <SelectItem value="DEF">Defender</SelectItem>
                                  <SelectItem value="MID">Midfielder</SelectItem>
                                  <SelectItem value="FWD">Forward</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kit Number</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="#" {...field} className="bg-black/20 border-white/10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-card border-white/10 text-white">
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Injured">Injured</SelectItem>
                                  <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-4 bg-primary text-white hover:bg-primary/90" disabled={createPlayer.isPending}>
                        {createPlayer.isPending ? "Creating..." : "Create Player"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedPlayers).map(([position, group]) => (
                <div key={position}>
                  <h3 className="text-lg font-bold text-muted-foreground mb-4 border-b border-white/10 pb-2">{position}s</h3>
                  {group.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No players in this position.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.map((player) => (
                        <div key={player.id} className="glass-panel p-5 rounded-xl group hover:border-primary/30 transition-all duration-300 relative">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-white font-bold shadow-inner">
                              {player.number || <User className="w-5 h-5 text-muted-foreground" />}
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${
                              player.status === 'Active' ? 'bg-green-500/10 text-green-400' : 
                              player.status === 'Injured' ? 'bg-red-500/10 text-red-400' : 
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {player.status}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-lg font-bold text-white truncate">{player.name}</h4>
                            <p className="text-sm text-muted-foreground">{player.position}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4 pt-4 border-t border-white/5">
                            <div>
                              <span className="block text-white font-bold text-sm">{player.stats?.goals || 0}</span>
                              Goals
                            </div>
                            <div>
                              <span className="block text-white font-bold text-sm">{player.stats?.assists || 0}</span>
                              Assists
                            </div>
                          </div>

                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-white/10 text-white">
                                <DropdownMenuItem onClick={() => handleDelete(player.id)} className="text-red-400 focus:text-red-300 focus:bg-red-900/10">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
