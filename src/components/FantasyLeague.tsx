import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, DollarSign, Plus, X, Crown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  max_drivers_per_team: number;
  budget_cap: number;
};

type Driver = {
  id: string;
  category_id: string;
  name: string;
  team_name: string | null;
  number: number | null;
  price: number;
  points: number;
};

type Team = {
  id: string;
  user_id: string;
  category_id: string;
  team_name: string;
  total_points: number;
  budget_remaining: number;
};

type TeamDriver = {
  id: string;
  team_id: string;
  driver_id: string;
};

const FantasyLeague = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myTeamDrivers, setMyTeamDrivers] = useState<TeamDriver[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("fantasy_categories")
        .select("*")
        .order("name");
      if (data) setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // Fetch category data when selected
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCategoryData = async () => {
      // Fetch drivers
      const { data: driversData } = await supabase
        .from("fantasy_drivers")
        .select("*")
        .eq("category_id", selectedCategory.id)
        .order("points", { ascending: false });
      if (driversData) setDrivers(driversData);

      // Fetch all teams for leaderboard
      const { data: teamsData } = await supabase
        .from("fantasy_teams")
        .select("*")
        .eq("category_id", selectedCategory.id)
        .order("total_points", { ascending: false });
      if (teamsData) setAllTeams(teamsData);

      // Fetch my team
      if (user) {
        const { data: myTeamData } = await supabase
          .from("fantasy_teams")
          .select("*")
          .eq("category_id", selectedCategory.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setMyTeam(myTeamData);

        if (myTeamData) {
          const { data: tdData } = await supabase
            .from("fantasy_team_drivers")
            .select("*")
            .eq("team_id", myTeamData.id);
          if (tdData) setMyTeamDrivers(tdData);
        } else {
          setMyTeamDrivers([]);
        }
      }
    };
    fetchCategoryData();
  }, [selectedCategory, user]);

  const createTeam = async () => {
    if (!user || !selectedCategory || !teamName.trim()) return;
    try {
      const { data, error } = await supabase
        .from("fantasy_teams")
        .insert({
          user_id: user.id,
          category_id: selectedCategory.id,
          team_name: teamName.trim(),
          budget_remaining: selectedCategory.budget_cap,
        })
        .select()
        .single();
      if (error) throw error;
      setMyTeam(data);
      setShowCreateForm(false);
      setTeamName("");
      toast({ title: "Η ομάδα δημιουργήθηκε! 🏁", description: `Πρόσθεσε οδηγούς στην ${data.team_name}` });
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    }
  };

  const addDriver = async (driver: Driver) => {
    if (!myTeam) return;
    if (myTeamDrivers.length >= (selectedCategory?.max_drivers_per_team || 5)) {
      toast({ title: "Πλήρης ομάδα", description: "Έφτασες το μέγιστο αριθμό οδηγών", variant: "destructive" });
      return;
    }
    if (myTeam.budget_remaining < driver.price) {
      toast({ title: "Ανεπαρκές budget", description: `Χρειάζεσαι ${driver.price}M αλλά έχεις ${myTeam.budget_remaining}M`, variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("fantasy_team_drivers")
        .insert({ team_id: myTeam.id, driver_id: driver.id })
        .select()
        .single();
      if (error) throw error;
      setMyTeamDrivers([...myTeamDrivers, data]);

      // Update budget & points
      const newBudget = Number(myTeam.budget_remaining) - driver.price;
      const newPoints = myTeam.total_points + driver.points;
      await supabase
        .from("fantasy_teams")
        .update({ budget_remaining: newBudget, total_points: newPoints })
        .eq("id", myTeam.id);
      setMyTeam({ ...myTeam, budget_remaining: newBudget, total_points: newPoints });

      toast({ title: `${driver.name} προστέθηκε!` });
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    }
  };

  const removeDriver = async (driver: Driver) => {
    if (!myTeam) return;
    try {
      const td = myTeamDrivers.find((td) => td.driver_id === driver.id);
      if (!td) return;
      const { error } = await supabase.from("fantasy_team_drivers").delete().eq("id", td.id);
      if (error) throw error;
      setMyTeamDrivers(myTeamDrivers.filter((d) => d.id !== td.id));

      const newBudget = Number(myTeam.budget_remaining) + driver.price;
      const newPoints = myTeam.total_points - driver.points;
      await supabase
        .from("fantasy_teams")
        .update({ budget_remaining: newBudget, total_points: newPoints })
        .eq("id", myTeam.id);
      setMyTeam({ ...myTeam, budget_remaining: newBudget, total_points: newPoints });
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    }
  };

  const isDriverInTeam = (driverId: string) => myTeamDrivers.some((td) => td.driver_id === driverId);

  // Category selection view
  if (!selectedCategory) {
    return (
      <div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">Διάλεξε Κατηγορία</h3>
        <p className="text-sm text-muted-foreground mb-6">Επέλεξε μια αγωνιστική κατηγορία για να δημιουργήσεις την ομάδα σου</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className="group rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-glow"
              >
                <span className="text-3xl">{cat.icon}</span>
                <h4 className="mt-3 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cat.max_drivers_per_team} οδηγοί</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {cat.budget_cap}M</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Category detail view
  return (
    <div>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelectedCategory(null)} className="text-sm text-primary hover:underline font-medium">
          ← Κατηγορίες
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground font-display font-bold">{selectedCategory.icon} {selectedCategory.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main area - Drivers */}
        <div className="flex-1">
          {/* My team card */}
          {user && (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              {myTeam ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-display text-lg font-bold text-foreground">{myTeam.team_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {myTeamDrivers.length}/{selectedCategory.max_drivers_per_team} οδηγοί • Budget: {Number(myTeam.budget_remaining).toFixed(1)}M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-gradient-racing">{myTeam.total_points}</p>
                      <p className="text-xs text-muted-foreground">πόντοι</p>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="h-2 rounded-full bg-secondary mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-racing rounded-full transition-all"
                      style={{ width: `${(Number(myTeam.budget_remaining) / selectedCategory.budget_cap) * 100}%` }}
                    />
                  </div>

                  {/* Team drivers */}
                  {myTeamDrivers.length > 0 ? (
                    <div className="space-y-2">
                      {myTeamDrivers.map((td) => {
                        const driver = drivers.find((d) => d.id === td.driver_id);
                        if (!driver) return null;
                        return (
                          <div key={td.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-bold text-primary">
                                #{driver.number}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{driver.name}</p>
                                <p className="text-xs text-muted-foreground">{driver.team_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-display font-bold text-accent">{driver.points}pts</span>
                              <button onClick={() => removeDriver(driver)} className="text-muted-foreground hover:text-primary">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Πρόσθεσε οδηγούς από τη λίστα παρακάτω</p>
                  )}
                </div>
              ) : (
                <div>
                  {showCreateForm ? (
                    <div className="flex gap-3">
                      <Input
                        placeholder="Όνομα ομάδας"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="h-11 bg-secondary/50 border-border"
                      />
                      <Button onClick={createTeam} disabled={!teamName.trim()} className="h-11 bg-gradient-racing text-primary-foreground font-display">
                        Δημιουργία
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateForm(false)} className="h-11">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center gap-2 text-primary hover:underline font-display font-semibold text-sm w-full justify-center py-3"
                    >
                      <Plus className="h-4 w-4" /> Δημιούργησε την ομάδα σου
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="rounded-xl border border-border bg-card p-6 mb-6 text-center">
              <p className="text-muted-foreground text-sm">Συνδέσου για να δημιουργήσεις την ομάδα σου!</p>
            </div>
          )}

          {/* Available drivers */}
          <h4 className="font-display text-base font-bold text-foreground mb-4">Διαθέσιμοι Οδηγοί</h4>
          <div className="space-y-2">
            {drivers.map((driver, i) => {
              const inTeam = isDriverInTeam(driver.id);
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    inTeam
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-foreground">
                      #{driver.number}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.team_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display text-sm font-bold text-accent">{driver.points}pts</p>
                      <p className="text-xs text-muted-foreground">{driver.price}M</p>
                    </div>
                    {user && myTeam && (
                      inTeam ? (
                        <Button size="sm" variant="outline" onClick={() => removeDriver(driver)} className="h-8 border-primary text-primary text-xs">
                          Αφαίρεση
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => addDriver(driver)} className="h-8 bg-gradient-racing text-primary-foreground text-xs font-display">
                          <Plus className="h-3 w-3 mr-1" /> Προσθήκη
                        </Button>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard sidebar */}
        <div className="w-full lg:w-72">
          <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-accent" />
              <h4 className="font-display text-base font-bold text-foreground">Κατάταξη</h4>
            </div>

            {allTeams.length > 0 ? (
              <div className="space-y-2">
                {allTeams.slice(0, 10).map((team, i) => (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between rounded-lg p-2.5 ${
                      team.user_id === user?.id ? "bg-primary/10 border border-primary/20" : "bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-sm font-bold ${
                        i === 0 ? "text-accent" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-orange-700" : "text-muted-foreground"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <span className="text-sm text-foreground truncate max-w-[120px]">{team.team_name}</span>
                    </div>
                    <span className="font-display text-sm font-bold text-gradient-racing">{team.total_points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Κανένα team ακόμα. Γίνε ο πρώτος!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FantasyLeague;
