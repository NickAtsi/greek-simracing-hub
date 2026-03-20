import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isApproved: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const { toast } = useToast();

  const checkApproval = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("is_approved")
      .eq("user_id", userId)
      .single();
    
    if (data && !(data as any).is_approved) {
      toast({
        title: "Λογαριασμός σε αναμονή",
        description: "Ο λογαριασμός σου δεν έχει εγκριθεί ακόμα από τους διαχειριστές.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      setIsApproved(false);
      return false;
    }
    setIsApproved(true);
    return true;
  };

  const updateLastSeen = async (userId: string) => {
    await supabase.from("profiles").update({ last_seen: new Date().toISOString() } as any).eq("user_id", userId);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => checkApproval(session.user.id), 0);
          updateLastSeen(session.user.id);
        } else {
          setIsApproved(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkApproval(session.user.id), 0);
        updateLastSeen(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Heartbeat: update last_seen every 2 minutes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => updateLastSeen(user.id), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isApproved, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
