import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Section = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
  <div id={id} className="mb-8 scroll-mt-24">
    <h2 className="font-display text-xl font-bold text-foreground mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
  </div>
);

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary" />
              <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Νομικά</span>
            </div>
            <h1 className="font-display text-4xl font-black uppercase text-foreground mb-2">
              <span className="text-gradient-racing">Πολιτική</span> Απορρήτου
            </h1>
            <p className="text-muted-foreground text-sm mb-10">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

            {/* Quick Nav */}
            <div className="rounded-xl border border-border bg-card p-4 mb-8">
              <p className="text-xs font-display font-bold text-muted-foreground mb-2 uppercase">Γρήγορη Πλοήγηση</p>
              <div className="flex flex-wrap gap-2">
                {["#data", "#use", "#cookies", "#gdpr", "#rights", "#contact"].map((anchor) => (
                  <a key={anchor} href={anchor} className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                    {anchor.replace("#", "")}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <Section title="Εισαγωγή">
                <p>Στο Greek SimRacers σεβόμαστε την ιδιωτικότητά σας. Αυτή η Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα προσωπικά σας δεδομένα.</p>
              </Section>

              <Section id="data" title="1. Δεδομένα που Συλλέγουμε">
                <p><strong className="text-foreground">Δεδομένα λογαριασμού:</strong> Email, όνομα χρήστη, κωδικός (κρυπτογραφημένος)</p>
                <p><strong className="text-foreground">Δεδομένα προφίλ:</strong> Display name, avatar, αγαπημένα sims και πίστες</p>
                <p><strong className="text-foreground">Περιεχόμενο χρήστη:</strong> Άρθρα, forum posts, σχόλια, likes</p>
                <p><strong className="text-foreground">Τεχνικά δεδομένα:</strong> IP διεύθυνση, browser type, cookies session</p>
              </Section>

              <Section id="use" title="2. Χρήση Δεδομένων">
                <p>Χρησιμοποιούμε τα δεδομένα σας για:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Παροχή και βελτίωση των υπηρεσιών μας</li>
                  <li>Αυθεντικοποίηση και ασφάλεια λογαριασμού</li>
                  <li>Personalization της εμπειρίας χρήστη</li>
                  <li>Επικοινωνία για υπηρεσίες support</li>
                  <li>Ανάλυση χρήσης για βελτίωση της πλατφόρμας</li>
                </ul>
                <p>Δεν πουλάμε ποτέ τα δεδομένα σας σε τρίτους.</p>
              </Section>

              <Section id="cookies" title="3. Cookies">
                <p>Χρησιμοποιούμε cookies για:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-foreground">Απαραίτητα:</strong> Session, authentication tokens</li>
                  <li><strong className="text-foreground">Λειτουργικά:</strong> Προτιμήσεις χρήστη, γλώσσα</li>
                  <li><strong className="text-foreground">Αναλυτικά:</strong> Ανώνυμα στατιστικά χρήσης</li>
                </ul>
                <p>Μπορείτε να διαγράψετε cookies από τις ρυθμίσεις του browser σας ανά πάσα στιγμή.</p>
              </Section>

              <Section id="gdpr" title="4. GDPR – Κανονισμός ΕΕ">
                <p>Συμμορφωνόμαστε πλήρως με τον GDPR (Κανονισμός ΕΕ 2016/679). Η νομική βάση επεξεργασίας των δεδομένων σας είναι:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Εκτέλεση σύμβασης (παροχή υπηρεσιών)</li>
                  <li>Συμμόρφωση με νομικές υποχρεώσεις</li>
                  <li>Έννομα συμφέροντά μας (ασφάλεια πλατφόρμας)</li>
                  <li>Συγκατάθεσή σας (marketing, analytics)</li>
                </ul>
              </Section>

              <Section id="rights" title="5. Δικαιώματά σας">
                <p>Έχετε δικαίωμα:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-foreground">Πρόσβασης:</strong> Να γνωρίζετε ποια δεδομένα τηρούμε για εσάς</li>
                  <li><strong className="text-foreground">Διόρθωσης:</strong> Να διορθώσετε ανακριβή δεδομένα</li>
                  <li><strong className="text-foreground">Διαγραφής:</strong> Να ζητήσετε διαγραφή του λογαριασμού σας</li>
                  <li><strong className="text-foreground">Φορητότητας:</strong> Να λάβετε αντίγραφο των δεδομένων σας</li>
                  <li><strong className="text-foreground">Εναντίωσης:</strong> Να αντιταχθείτε στην επεξεργασία για marketing</li>
                </ul>
                <p>Για άσκηση δικαιωμάτων: <strong className="text-foreground">privacy@greeksimracers.gr</strong></p>
              </Section>

              <Section title="6. Ασφάλεια Δεδομένων">
                <p>Εφαρμόζουμε τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων σας, συμπεριλαμβανομένης κρυπτογράφησης SSL, Row Level Security στη βάση δεδομένων και τακτικά backups.</p>
              </Section>

              <Section id="contact" title="7. Επικοινωνία για Απόρρητο">
                <p>Υπεύθυνος Προστασίας Δεδομένων: <strong className="text-foreground">privacy@greeksimracers.gr</strong></p>
                <p>Έχετε το δικαίωμα να υποβάλετε καταγγελία στην <strong className="text-foreground">Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα</strong> (www.dpa.gr) αν θεωρείτε ότι τα δικαιώματά σας παραβιάζονται.</p>
              </Section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
