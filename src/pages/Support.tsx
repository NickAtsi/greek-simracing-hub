import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
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

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  open: { label: "Ανοιχτό", icon: AlertCircle, color: "text-amber-400" },
  in_progress: { label: "Σε Εξέλιξη", icon: Clock, color: "text-blue-400" },
  resolved: { label: "Επιλύθηκε", icon: CheckCircle, color: "text-green-400" },
  closed: { label: "Κλειστό", icon: XCircle, color: "text-muted-foreground" },
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
      .select("*, profiles!sender_id(display_name, username, avatar_url)")
      .eq("ticket_id", ticketId)
      .order("created_at");
    setMessages((data as any[]) || []);
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
    );
  }

  return (
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
                <p className="text-muted-foreground mt-1">Επικοινωνήστε απευθείας με την ομάδα μας</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                <Plus className="h-4 w-4" /> Νέο Ticket
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          {tickets.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">Δεν έχεις ανοιχτά tickets.</p>
              <Button onClick={() => setShowCreate(true)} className="bg-gradient-greek text-white hover:brightness-110">
                Άνοιξε το πρώτο ticket
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="space-y-2">
                {tickets.map((ticket: any) => {
                  const status = statusConfig[ticket.status] || statusConfig.open;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${selectedTicket?.id === ticket.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-display text-sm font-bold text-foreground truncate">{ticket.subject}</p>
                        <status.icon className={`h-4 w-4 flex-shrink-0 ${status.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString("el-GR")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                {selectedTicket ? (
                  <div className="rounded-xl border border-border bg-card flex flex-col" style={{ height: "600px" }}>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">{selectedTicket.subject}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {(() => {
                            const s = statusConfig[selectedTicket.status] || statusConfig.open;
                            return <span className={`text-xs flex items-center gap-1 ${s.color}`}><s.icon className="h-3 w-3" />{s.label}</span>;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-8">Δεν υπάρχουν μηνύματα ακόμα.</p>
                      )}
                      {messages.map((msg: any) => {
                        const isMe = msg.sender_id === user.id;
                        const senderProfile = msg.profiles;
                        const senderName = senderProfile?.display_name || senderProfile?.username || (msg.is_admin ? "Support Team" : "Εσύ");
                        return (
                          <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={senderProfile?.avatar_url || ""} />
                              <AvatarFallback className={`text-xs font-bold ${msg.is_admin ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
                                {msg.is_admin ? <Shield className="h-4 w-4" /> : senderName.slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{msg.is_admin ? "Support Team" : senderName}</span>
                                <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <div className={`rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary/60 text-foreground rounded-tl-sm"}`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" ? (
                      <div className="p-4 border-t border-border flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Γράψε το μήνυμά σου..."
                          className="bg-secondary/50"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        />
                        <Button onClick={handleSendMessage} disabled={sendingMsg || !newMessage.trim()} className="bg-gradient-greek text-white hover:brightness-110 px-4">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
                        Αυτό το ticket έχει κλείσει.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card flex items-center justify-center" style={{ height: "600px" }}>
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Επίλεξε ένα ticket για να δεις τη συνομιλία</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Νέο Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Θέμα</label>
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
              <select value={newTicket.priority} onChange={(e) => setNewTicket(p => ({ ...p, priority: e.target.value }))}
                className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
                <option value="low">Χαμηλή</option>
                <option value="normal">Κανονική</option>
                <option value="high">Υψηλή</option>
                <option value="urgent">Επείγον</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Μήνυμα</label>
              <Textarea
                placeholder="Περίγραψε αναλυτικά το πρόβλημά σου..."
                value={newTicket.message}
                onChange={(e) => setNewTicket(p => ({ ...p, message: e.target.value }))}
                rows={5}
                className="resize-none bg-secondary/50"
                maxLength={2000}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Ακύρωση</Button>
              <Button onClick={handleCreateTicket} disabled={submitting} className="bg-gradient-greek text-white hover:brightness-110">
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
