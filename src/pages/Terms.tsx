import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="font-display text-xl font-bold text-foreground mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
  </div>
);

const Terms = () => {
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
              <span className="text-gradient-racing">Όροι</span> Χρήσης
            </h1>
            <p className="text-muted-foreground text-sm mb-10">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

            <div className="rounded-xl border border-border bg-card p-8">
              <Section title="1. Αποδοχή Όρων">
                <p>Χρησιμοποιώντας τον ιστότοπο Greek SimRacers (greeksimracers.gr), αποδέχεστε αυτούς τους Όρους Χρήσης. Αν δεν συμφωνείτε, παρακαλούμε να μην χρησιμοποιείτε τις υπηρεσίες μας.</p>
              </Section>

              <Section title="2. Περιγραφή Υπηρεσιών">
                <p>Το Greek SimRacers είναι μια ελληνική πλατφόρμα αφιερωμένη στο Sim Racing, προσφέροντας:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Forum συζητήσεων και άρθρα κοινότητας</li>
                  <li>Podcasts και περιεχόμενο για τη μηχανοκίνηση</li>
                  <li>Αγώνες και πρωταθλήματα Sim Racing</li>
                  <li>Fantasy League και games</li>
                  <li>Σύστημα προφίλ και κοινωνικές λειτουργίες</li>
                </ul>
              </Section>

              <Section title="3. Λογαριασμοί Χρηστών">
                <p>Για να αποκτήσετε πλήρη πρόσβαση στις υπηρεσίες μας, πρέπει να δημιουργήσετε λογαριασμό. Είστε υπεύθυνοι για:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Την ασφάλεια του κωδικού πρόσβασής σας</li>
                  <li>Όλες τις δραστηριότητες που γίνονται μέσω του λογαριασμού σας</li>
                  <li>Την ειλικρίνεια των πληροφοριών που παρέχετε</li>
                </ul>
                <p>Διατηρούμε το δικαίωμα να αναστείλουμε ή να τερματίσουμε λογαριασμούς που παραβαίνουν τους όρους χρήσης.</p>
              </Section>

              <Section title="4. Κανόνες Κοινότητας">
                <p>Απαγορεύεται αυστηρά:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Ανάρτηση υβριστικού, ρατσιστικού ή παράνομου περιεχομένου</li>
                  <li>Spam και διαφημιστικά μηνύματα χωρίς άδεια</li>
                  <li>Παρενόχληση άλλων μελών</li>
                  <li>Κοινοποίηση προσωπικών δεδομένων τρίτων χωρίς συναίνεση</li>
                  <li>Εξαπάτηση ή παραπλάνηση άλλων μελών</li>
                  <li>Παραβίαση πνευματικών δικαιωμάτων</li>
                </ul>
              </Section>

              <Section title="5. Πνευματική Ιδιοκτησία">
                <p>Το περιεχόμενο που δημιουργείτε (άρθρα, σχόλια, posts) παραμένει δικό σας, αλλά μας παρέχετε άδεια να το εμφανίζουμε στην πλατφόρμα. Το brand Greek SimRacers, το λογότυπο και το αποκλειστικό περιεχόμενο μας προστατεύονται από πνευματικά δικαιώματα.</p>
              </Section>

              <Section title="6. Περιορισμός Ευθύνης">
                <p>Το Greek SimRacers δεν φέρει ευθύνη για περιεχόμενο που δημιουργείται από χρήστες. Δεν εγγυόμαστε την αδιάλειπτη λειτουργία της πλατφόρμας. Παρέχουμε τις υπηρεσίες "ως έχουν" χωρίς εγγυήσεις αποτελεσμάτων.</p>
              </Section>

              <Section title="7. Τροποποίηση Όρων">
                <p>Διατηρούμε το δικαίωμα να τροποποιούμε τους παρόντες όρους ανά πάσα στιγμή. Θα σας ειδοποιούμε για σημαντικές αλλαγές. Η συνέχιση χρήσης της πλατφόρμας μετά από αλλαγές συνιστά αποδοχή των νέων όρων.</p>
              </Section>

              <Section title="8. Εφαρμοστέο Δίκαιο">
                <p>Οι παρόντες Όροι Χρήσης διέπονται από το ελληνικό δίκαιο και την ευρωπαϊκή νομοθεσία. Για οποιαδήποτε διαφορά, αρμόδια είναι τα δικαστήρια της Αθήνας.</p>
              </Section>

              <Section title="9. Επικοινωνία">
                <p>Για ερωτήσεις σχετικά με τους Όρους Χρήσης, επικοινωνήστε μαζί μας στη διεύθυνση: <strong className="text-foreground">info@greeksimracers.gr</strong></p>
              </Section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
