import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Χαμηλή", color: "bg-secondary text-muted-foreground" },
  normal: { label: "Κανονική", color: "bg-blue-500/20 text-blue-400" },
  high: { label: "Υψηλή", color: "bg-orange-500/20 text-orange-400" },
  urgent: { label: "Επείγον", color: "bg-destructive/20 text-destructive" },
};

const statusConfig: Record<string, { label: string; icon: any; color: string; badge: string }> = {
  open: { label: "Ανοιχτό", icon: AlertCircle, color: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
  in_progress: { label: "Σε Εξέλιξη", icon: Clock, color: "text-blue-400", badge: "bg-blue-500/20 text-blue-400" },
  resolved: { label: "Επιλύθηκε", icon: CheckCircle, color: "text-green-400", badge: "bg-green-500/20 text-green-400" },
  closed: { label: "Κλειστό", icon: XCircle, color: "text-muted-foreground", badge: "bg-secondary text-muted-foreground" },
};

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "normal" });
  const [submitting, setSubmitting] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedTicketRef = useRef<any>(null);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
    if (selectedTicket) fetchMessages(selectedTicket.id);
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("support-messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        async (payload) => {
          const current = selectedTicketRef.current;
          if (current && payload.new.ticket_id === current.id) {
            // Fetch the new message with profile info
            const { data } = await supabase
              .from("support_messages" as any)
              .select("*, profiles!sender_id(display_name, username, avatar_url)")
              .eq("id", payload.new.id)
              .single();
            if (data) {
              setMessages(prev => [...prev, data as any]);
            }
          }
          // Refresh ticket list to update timestamps
          fetchTickets();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("support_tickets" as any)
      .select("*")
      .order("updated_at", { ascending: false });
    setTickets((data as any[]) || []);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("support_messages" as any)
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at");
    const msgs = (data as any[]) || [];
    // Manual join for profiles since there's no FK
    const senderIds = [...new Set(msgs.map((m: any) => m.sender_id))];
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", senderIds);
      const profileMap: Record<string, any> = {};
      ((profiles as any[]) || []).forEach((p: any) => { profileMap[p.user_id] = p; });
      msgs.forEach((m: any) => { m.profiles = profileMap[m.sender_id] || null; });
    }
    setMessages(msgs);
  };


  const handleCreateTicket = async () => {
    if (!user) return;
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast({ title: "Συμπλήρωσε θέμα και μήνυμα", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data: ticket, error } = await supabase
      .from("support_tickets" as any)
      .insert({ user_id: user.id, subject: newTicket.subject, priority: newTicket.priority })
      .select().single();
    if (!error && ticket) {
      // Add the first message
      await supabase.from("support_messages" as any).insert({
        ticket_id: (ticket as any).id,
        sender_id: user.id,
        content: newTicket.message,
        is_admin: false,
      });
      toast({ title: "Ticket δημιουργήθηκε!" });
      setShowCreate(false);
      setNewTicket({ subject: "", message: "", priority: "normal" });
      fetchTickets();
      setSelectedTicket(ticket);
    }
    setSubmitting(false);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;
    setSendingMsg(true);
    const msgContent = newMessage.trim();
    setNewMessage(""); // clear immediately for better UX
    await supabase.from("support_messages" as any).insert({
      ticket_id: selectedTicket.id,
      sender_id: user.id,
      content: msgContent,
      is_admin: false,
    });
    // Update ticket updated_at
    await supabase.from("support_tickets" as any).update({ updated_at: new Date().toISOString() } as any).eq("id", selectedTicket.id);
    setSendingMsg(false);
  };

  if (!user) {
    return (
      <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <MessageCircle className="h-16 w-16 text-muted-foreground opacity-40" />
          <h1 className="font-display text-2xl font-bold text-foreground">Συνδέσου για Support</h1>
          <p className="text-muted-foreground">Χρειάζεσαι λογαριασμό για να ανοίξεις ticket υποστήριξης.</p>
          <Link to="/auth"><Button className="bg-gradient-greek text-white hover:brightness-110">Σύνδεση / Εγγραφή</Button></Link>
        </div>
        <Footer />
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="relative border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary" />
              <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Υποστήριξη</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-black uppercase text-foreground">
                  <span className="text-gradient-racing">Support</span> Tickets
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">Επικοινωνήστε απευθείας με την ομάδα μας</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                <Plus className="h-4 w-4" /> Νέο Ticket
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-6">
          {tickets.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <MessageCircle className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-5 text-lg font-display font-bold">Δεν έχεις ανοιχτά tickets.</p>
              <Button onClick={() => setShowCreate(true)} className="bg-gradient-greek text-white hover:brightness-110 gap-2">
                <Plus className="h-4 w-4" /> Άνοιξε το πρώτο ticket
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
              {/* Ticket List */}
              <div className="space-y-2">
                <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Tickets ({tickets.length})
                </p>
                {tickets.map((ticket: any) => {
                  const status = statusConfig[ticket.status] || statusConfig.open;
                  const priority = priorityConfig[ticket.priority] || priorityConfig.normal;
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <motion.button
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/40"}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-display text-sm font-bold text-foreground truncate flex-1">{ticket.subject}</p>
                        <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badge}`}>
                          <status.icon className="h-3 w-3" />{status.label}
                        </span>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.color}`}>
                          {priority.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {new Date(ticket.updated_at).toLocaleDateString("el-GR")}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Chat Window */}
              <div>
                {selectedTicket ? (
                  <motion.div
                    key={selectedTicket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card flex flex-col"
                    style={{ height: "640px" }}
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-display text-sm font-bold text-foreground">{selectedTicket.subject}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {(() => {
                              const s = statusConfig[selectedTicket.status] || statusConfig.open;
                              const p = priorityConfig[selectedTicket.priority] || priorityConfig.normal;
                              return (
                                <>
                                  <span className={`text-[10px] font-bold flex items-center gap-1 ${s.color}`}>
                                    <s.icon className="h-3 w-3" />{s.label}
                                  </span>
                                  <span className="text-muted-foreground text-[10px]">·</span>
                                  <span className="text-[10px] text-muted-foreground font-bold">{p.label}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">#{selectedTicket.id.slice(0, 8)}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-center text-muted-foreground text-sm">Δεν υπάρχουν μηνύματα ακόμα.</p>
                        </div>
                      )}
                      {messages.map((msg: any, i: number) => {
                        const isMe = msg.sender_id === user.id;
                        const senderProfile = msg.profiles;
                        const senderName = senderProfile?.display_name || senderProfile?.username || (msg.is_admin ? "Support Team" : "Εσύ");
                        const showHeader = i === 0 || messages[i - 1]?.sender_id !== msg.sender_id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
                          >
                            <div className="flex-shrink-0 w-8">
                              {showHeader && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={senderProfile?.avatar_url || ""} />
                                  <AvatarFallback className={`text-xs font-bold ${msg.is_admin ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
                                    {msg.is_admin ? <Shield className="h-4 w-4" /> : senderName.slice(0, 1).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                              {showHeader && (
                                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                  <span className="text-[11px] font-bold text-foreground">{msg.is_admin ? "Support Team" : senderName}</span>
                                  {msg.is_admin && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-display font-bold">ADMIN</span>}
                                  <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              )}
                              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : msg.is_admin ? "bg-primary/10 border border-primary/20 text-foreground rounded-tl-none" : "bg-secondary/60 text-foreground rounded-tl-none"}`}>
                                {msg.content}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" ? (
                      <div className="p-4 border-t border-border flex gap-2 bg-secondary/10 rounded-b-xl">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Γράψε το μήνυμά σου... (Enter για αποστολή)"
                          className="bg-background border-border"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendingMsg || !newMessage.trim()}
                          className="bg-gradient-greek text-white hover:brightness-110 px-4"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 border-t border-border text-center text-sm text-muted-foreground bg-secondary/10 rounded-b-xl flex items-center justify-center gap-2">
                        <XCircle className="h-4 w-4 opacity-50" />
                        Αυτό το ticket έχει κλείσει.
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="rounded-xl border border-border bg-card flex items-center justify-center" style={{ height: "640px" }}>
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-14 w-14 mx-auto mb-3 opacity-20" />
                      <p className="font-display font-bold">Επίλεξε ένα ticket</p>
                      <p className="text-sm mt-1">για να δεις τη συνομιλία</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Νέο Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Θέμα *</label>
              <Input
                placeholder="Περίγραψε σύντομα το πρόβλημά σου..."
                value={newTicket.subject}
                onChange={(e) => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                className="bg-secondary/50"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Προτεραιότητα</label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "normal", "high", "urgent"] as const).map((key) => {
                  const val = priorityConfig[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setNewTicket(p => ({ ...p, priority: key }))}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${newTicket.priority === key ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40"}`}
                    >
                      {val.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Μήνυμα *</label>
              <Textarea
                placeholder="Περίγραψε αναλυτικά το πρόβλημά σου..."
                value={newTicket.message}
                onChange={(e) => setNewTicket(p => ({ ...p, message: e.target.value }))}
                rows={5}
                className="resize-none bg-secondary/50"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">{newTicket.message.length}/2000</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Ακύρωση</Button>
              <Button onClick={handleCreateTicket} disabled={submitting} className="bg-gradient-greek text-white hover:brightness-110 gap-2">
                <MessageCircle className="h-4 w-4" />
                {submitting ? "Δημιουργία..." : "Δημιουργία Ticket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Support;
