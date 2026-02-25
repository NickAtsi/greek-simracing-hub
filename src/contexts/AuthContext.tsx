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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => checkApproval(session.user.id), 0);
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
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isApproved, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
