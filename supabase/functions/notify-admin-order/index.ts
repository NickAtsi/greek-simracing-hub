import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, full_name, email, total, items_count } = await req.json();

    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('DISCORD_WEBHOOK_URL is not configured');
    }

    const embed = {
      title: '🛒 Νέα Παραγγελία!',
      color: 0x2ecc71,
      fields: [
        { name: '🆔 Order ID', value: order_id?.slice(0, 8) || 'N/A', inline: true },
        { name: '👤 Πελάτης', value: full_name || 'N/A', inline: true },
        { name: '📧 Email', value: email || 'N/A', inline: true },
        { name: '💰 Σύνολο', value: `€${Number(total).toFixed(2)}`, inline: true },
        { name: '📦 Προϊόντα', value: `${items_count} τεμάχια`, inline: true },
        { name: '📅 Ημερομηνία', value: new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' }), inline: false },
      ],
      footer: { text: 'SimGreek Central - Shop Notification' },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SimGreek Shop Bot',
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discord webhook failed [${response.status}]: ${text}`);
    }

    await response.text().catch(() => {});

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending order notification:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
