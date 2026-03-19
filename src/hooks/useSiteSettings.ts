import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const defaultSettings: Record<string, string> = {
  discord_server_id: "459797812251590677",
  discord_invite: "https://discord.gg/v5RsBTnPpY",
  contact_email: "info@greeksimracers.gr",
  site_name: "Greek SimRacers",
  site_tagline: "Η #1 Ελληνική πλατφόρμα SimRacing",
  footer_text: "Made with ❤️ in Greece",
  youtube_url: "https://www.youtube.com/@GreekSimracers",
  facebook_url: "https://www.facebook.com/groups/greeksimracers",
  spotify_url: "https://open.spotify.com/show/62c9vN8ZOT4unAzzJmtOXD?si=7d89b491724e41fd",
  support_hours: "Δευτ–Παρ: 10:00–22:00",
  maintenance_mode: "false",
  registration_enabled: "true",
};

let cachedSettings: Record<string, string> | null = null;
let listeners: Array<(s: Record<string, string>) => void> = [];

const notifyListeners = (s: Record<string, string>) => {
  listeners.forEach((fn) => fn(s));
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>(cachedSettings || defaultSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    const handler = (s: Record<string, string>) => setSettings(s);
    listeners.push(handler);

    if (!cachedSettings) {
      fetchSettings().then((s) => {
        setSettings(s);
        setLoading(false);
      });
    }

    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return { settings, loading };
};

export const fetchSettings = async (): Promise<Record<string, string>> => {
  const { data } = await supabase.from("site_settings" as any).select("*");
  const map = { ...defaultSettings };
  ((data as any[]) || []).forEach((s: any) => {
    if (s.value) map[s.key] = s.value;
  });
  cachedSettings = map;
  return map;
};

export const refreshSettingsCache = async () => {
  const s = await fetchSettings();
  notifyListeners(s);
  return s;
};

export { defaultSettings };
