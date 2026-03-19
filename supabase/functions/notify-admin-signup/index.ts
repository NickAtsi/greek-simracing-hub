import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, display_name } = await req.json();

    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('DISCORD_WEBHOOK_URL is not configured');
    }

    const embed = {
      title: '🆕 Νέα Εγγραφή Χρήστη',
      color: 0x00b894,
      fields: [
        { name: '📧 Email', value: email || 'N/A', inline: true },
        { name: '👤 Όνομα', value: display_name || 'N/A', inline: true },
        { name: '📅 Ημερομηνία', value: new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' }), inline: false },
      ],
      footer: { text: 'SimGreek Central - Admin Notification' },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SimGreek Bot',
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discord webhook failed [${response.status}]: ${text}`);
    }

    // Consume response body
    await response.text().catch(() => {});

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
