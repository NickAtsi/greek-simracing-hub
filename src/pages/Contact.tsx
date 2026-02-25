import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, MapPin, Send, Headphones, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Συμπλήρωσε όλα τα απαραίτητα πεδία", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    toast({ title: "Το μήνυμά σου εστάλη!", description: "Θα σου απαντήσουμε σύντομα." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-8 bg-primary" />
                <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Επικοινωνία</span>
              </div>
              <h1 className="font-display text-4xl font-black uppercase text-foreground">
                <span className="text-gradient-racing">Επικοινωνήστε</span> μαζί μας
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Έχεις ερωτήσεις, προτάσεις ή θέλεις να συνεργαστείς; Είμαστε εδώ για εσάς!
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  desc: "Στείλτε μας email για οποιοδήποτε θέμα",
                  value: "info@greeksimracers.gr",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                },
                {
                  icon: MessageSquare,
                  title: "Discord",
                  desc: "Γίνε μέλος της κοινότητάς μας",
                  value: "discord.gg/v5RsBTnPpY",
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/10",
                },
                {
                  icon: Headphones,
                  title: "Support",
                  desc: "Άνοιξε ένα ticket για άμεση βοήθεια",
                  value: "Σύστημα Tickets",
                  color: "text-primary",
                  bg: "bg-primary/10",
                  isLink: true,
                  href: "/support",
                },
                {
                  icon: Clock,
                  title: "Ώρες Υποστήριξης",
                  desc: "Διαθέσιμοι για βοήθεια",
                  value: "Δευτ–Παρ: 10:00–22:00",
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border border-border bg-card p-5 flex items-start gap-4"
                >
                  <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{item.desc}</p>
                    {item.isLink ? (
                      <Link to={item.href!} className={`text-sm font-medium ${item.color} hover:underline`}>{item.value}</Link>
                    ) : (
                      <p className={`text-sm font-medium ${item.color}`}>{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Φόρμα Επικοινωνίας</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Όνομα *</label>
                    <Input
                      placeholder="Το όνομά σου..."
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      className="bg-secondary/50 border-border"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email *</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                      className="bg-secondary/50 border-border"
                      maxLength={255}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Θέμα</label>
                  <Input
                    placeholder="Θέμα μηνύματος..."
                    value={form.subject}
                    onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="bg-secondary/50 border-border"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Μήνυμα *</label>
                  <Textarea
                    placeholder="Γράψε το μήνυμά σου εδώ..."
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    rows={7}
                    className="resize-none bg-secondary/50 border-border"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/2000</p>
                </div>

                {/* FAQ quick links */}
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                  <p className="text-xs font-display font-bold text-muted-foreground mb-2">ΣΥΧΝΕΣ ΕΡΩΤΗΣΕΙΣ</p>
                  <div className="flex flex-wrap gap-2">
                    {["Εγγραφή στο Forum", "Πρόβλημα σύνδεσης", "Κανονισμοί αγώνων", "Συνεργασία"].map(q => (
                      <button key={q} type="button" onClick={() => setForm(p => ({ ...p, subject: q }))}
                        className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting} className="gap-2 bg-gradient-greek text-white hover:brightness-110 px-8">
                    <Send className="h-4 w-4" />
                    {submitting ? "Αποστολή..." : "Αποστολή Μηνύματος"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
