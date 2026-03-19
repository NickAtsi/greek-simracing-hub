import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface DiscordMember {
  id: string;
  username: string;
  avatar_url: string | null;
  status: string;
  game?: { name: string } | null;
}

interface DiscordData {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
  members: DiscordMember[];
}

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-amber-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
};

const DiscordWidget = () => {
  const { settings } = useSiteSettings();
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const serverId = settings.discord_server_id;
  const inviteFallback = settings.discord_invite;

  useEffect(() => {
    fetchWidget();
    const interval = setInterval(fetchWidget, 60000);
    return () => clearInterval(interval);
  }, [serverId]);

  const fetchWidget = async () => {
    try {
      const res = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
      if (!res.ok) throw new Error("Widget fetch failed");
      const json = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = data?.instant_invite || inviteFallback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#5865F2]/10 border-b border-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#5865F2] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">{data?.name || "Greek SimRacers"}</h3>
            {data && (
              <p className="text-xs text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                {data.presence_count} Online
              </p>
            )}
          </div>
        </div>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-[#5865F2] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#4752C4] hover:scale-105"
        >
          Σύνδεση <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Members */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5865F2]" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-2">Αδυναμία φόρτωσης widget</p>
            <a href={inviteFallback} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#5865F2] hover:underline">
              Σύνδεση στο Discord →
            </a>
          </div>
        ) : data?.members?.length ? (
          <div className="space-y-1.5">
            {data.members.slice(0, 15).map((member) => (
              <div key={member.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-secondary/30 transition-colors">
                <div className="relative flex-shrink-0">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#5865F2]/30 flex items-center justify-center text-[10px] font-bold text-[#5865F2]">
                      {member.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${statusColors[member.status] || "bg-gray-500"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{member.username}</p>
                  {member.game && (
                    <p className="text-[10px] text-muted-foreground truncate">🎮 {member.game.name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Κανένα μέλος online</p>
        )}
      </div>
    </motion.div>
  );
};

export default DiscordWidget;
