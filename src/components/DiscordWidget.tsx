import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

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

const DISCORD_SERVER_ID = "459797812251590677";
const DISCORD_INVITE = "https://discord.gg/greeksimracers";

const DiscordWidget = () => {
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchWidget();
    const interval = setInterval(fetchWidget, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fetchWidget = async () => {
    try {
      const res = await fetch(`https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`);
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

  const inviteUrl = data?.instant_invite || DISCORD_INVITE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-[#5865F2]/30 bg-[#36393f]/80 backdrop-blur-sm overflow-hidden"
    >
      {/* Discord Header */}
      <div className="bg-[#5865F2] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          <div>
            <p className="font-display text-sm font-bold text-white">{data?.name || "Greek SimRacers"}</p>
            <p className="text-xs text-white/70">Discord Server</p>
          </div>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/80 font-medium">{data?.presence_count || 0} online</span>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5865F2]" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400 mb-1">Αδύνατη η φόρτωση widget</p>
            <p className="text-xs text-gray-500">Σύνδεσε μέσω του παρακάτω link</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              Online — {data?.presence_count || 0}
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {(data?.members || []).slice(0, 12).map((member) => (
                <div key={member.id} className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.username} className="h-7 w-7 rounded-full" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-[#5865F2]/40 flex items-center justify-center text-xs font-bold text-white">
                        {member.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#36393f] ${statusColors[member.status] || "bg-gray-500"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-200 truncate">{member.username}</p>
                    {member.game && (
                      <p className="text-[10px] text-[#5865F2] truncate">{member.game.name}</p>
                    )}
                  </div>
                </div>
              ))}
              {(data?.members?.length || 0) === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">Κανείς online αυτή τη στιγμή</p>
              )}
            </div>
          </div>
        )}

        {/* Join Button */}
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition-colors py-2.5 text-sm font-display font-bold text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Γίνε Μέλος
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
};

export default DiscordWidget;
