import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, Eye, Heart, X, Plus, Minus, Tag, Package, MapPin, User, Mail, Phone, FileText, CheckCircle, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

// Fallback images for seeded products
import tshirtBlack from "@/assets/shop/tshirt-black.png";
import tshirtWhite from "@/assets/shop/tshirt-white.png";
import keychainHelmet from "@/assets/shop/keychain-helmet.png";
import keychainWheel from "@/assets/shop/keychain-wheel.png";
import hoodieNavy from "@/assets/shop/hoodie-navy.png";
import capBlue from "@/assets/shop/cap-blue.png";

const fallbackImages: Record<string, string> = {
  "tshirt-black": tshirtBlack, "tshirt-white": tshirtWhite,
  "keychain-helmet": keychainHelmet, "keychain-wheel": keychainWheel,
  "hoodie-navy": hoodieNavy, "cap-blue": capBlue,
};

interface Product {
  id: string; name: string; description: string | null; price: number;
  original_price: number | null; image_url: string | null; category: string;
  badge: string | null; sizes: string[] | null; stock: number; active: boolean;
}

const categories = ["Όλα", "Ρούχα", "Αξεσουάρ", "Μπρελόκ"];

const Shop = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Όλα");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number; size?: string }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [checkoutForm, setCheckoutForm] = useState({ full_name: "", email: "", address: "", city: "", postal_code: "", phone: "", notes: "" });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("shop_products" as any).select("*").eq("active", true).order("created_at", { ascending: false });
    setProducts((data as any[]) || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase.from("shop_orders" as any).select("*, shop_order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    setOrders((data as any[]) || []);
  };

  const getImage = (p: Product) => {
    if (p.image_url && fallbackImages[p.image_url]) return fallbackImages[p.image_url];
    if (p.image_url) return p.image_url;
    return tshirtBlack;
  };

  const filteredProducts = selectedCategory === "Όλα" ? products : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product, size?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id && c.size === size);
      if (existing) return prev.map(c => c.product.id === product.id && c.size === size ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1, size }];
    });
    toast({ title: "Προστέθηκε στο καλάθι! 🛒", description: product.name });
  };

  const removeFromCart = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx));
  const updateQty = (idx: number, delta: number) => {
    setCart(prev => prev.map((c, i) => i === idx ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const cartTotal = cart.reduce((sum, c) => sum + Number(c.product.price) * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleCheckout = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!checkoutForm.full_name || !checkoutForm.email || !checkoutForm.address || !checkoutForm.city || !checkoutForm.postal_code) {
      toast({ title: "Συμπλήρωσε όλα τα υποχρεωτικά πεδία", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase.from("shop_orders" as any).insert({
        user_id: user.id,
        total: cartTotal,
        full_name: checkoutForm.full_name,
        email: checkoutForm.email,
        address: checkoutForm.address,
        city: checkoutForm.city,
        postal_code: checkoutForm.postal_code,
        phone: checkoutForm.phone || null,
        notes: checkoutForm.notes || null,
      } as any).select().single();

      if (orderError) throw orderError;

      // Create order items
      const items = cart.map(c => ({
        order_id: (order as any).id,
        product_id: c.product.id,
        product_name: c.product.name,
        product_image: c.product.image_url,
        price: c.product.price,
        quantity: c.qty,
        size: c.size || null,
      }));

      await supabase.from("shop_order_items" as any).insert(items as any);

      // Notify admin via Discord
      const { error: notifyError } = await supabase.functions.invoke('notify-admin-order', {
        body: {
          order_id: (order as any).id,
          full_name: checkoutForm.full_name,
          email: checkoutForm.email,
          total: cartTotal,
          items_count: cart.reduce((s, c) => s + c.qty, 0),
        },
      });

      if (notifyError) {
        console.error('notify-admin-order failed:', notifyError);
      }

      setOrderSuccess(true);
      setCart([]);
      setCheckoutForm({ full_name: "", email: "", address: "", city: "", postal_code: "", phone: "", notes: "" });
    } catch (err: any) {
      toast({ title: "Σφάλμα", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Σε αναμονή", color: "text-amber-500 bg-amber-500/15" },
    confirmed: { label: "Επιβεβαιωμένη", color: "text-blue-500 bg-blue-500/15" },
    shipped: { label: "Απεστάλη", color: "text-primary bg-primary/15" },
    delivered: { label: "Παραδόθηκε", color: "text-green-500 bg-green-500/15" },
    cancelled: { label: "Ακυρώθηκε", color: "text-destructive bg-destructive/15" },
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 font-display text-xs tracking-wider">
              <Tag className="h-3 w-3 mr-1" /> OFFICIAL MERCH
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-black text-foreground mb-4">
              GSR <span className="text-gradient-racing">Shop</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Επίσημο merchandise της κοινότητας. Φόρεσε τα χρώματά μας στην πίστα και εκτός! 🏁
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filters & Cart/Orders Buttons */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground shadow-racing" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border"
                }`}>{cat}</motion.button>
            ))}
          </div>
          <div className="flex gap-2">
            {user && (
              <Button variant="outline" onClick={() => { fetchOrders(); setShowOrders(true); }} className="gap-2 border-border">
                <History className="h-4 w-4" /> Παραγγελίες μου
              </Button>
            )}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button onClick={() => setShowCart(true)} className="gap-2 relative bg-primary hover:bg-primary/90">
                <ShoppingCart className="h-4 w-4" /> Καλάθι
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Δεν υπάρχουν διαθέσιμα προϊόντα ακόμα.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-secondary/30">
                    <motion.img src={getImage(product)} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedProduct(product); setSelectedSize(""); }}
                        className="bg-card/80 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Προβολή
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleFavorite(product.id)}
                        className={`bg-card/80 backdrop-blur-sm border-border ${favorites.has(product.id) ? "text-red-500" : ""}`}>
                        <Heart className={`h-3.5 w-3.5 ${favorites.has(product.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-display font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-glow">
                        {product.badge}
                      </span>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <span className="font-display text-sm font-bold text-destructive">ΕΞΑΝΤΛΗΘΗΚΕ</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1">{product.category}</p>
                    <h3 className="font-display text-sm font-bold text-foreground mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-lg font-black text-primary">€{Number(product.price).toFixed(2)}</span>
                        {product.original_price && <span className="text-xs text-muted-foreground line-through">€{Number(product.original_price).toFixed(2)}</span>}
                      </div>
                      <Button size="sm" disabled={product.stock <= 0}
                        onClick={() => product.sizes?.length ? (setSelectedProduct(product), setSelectedSize("")) : addToCart(product)}
                        className="h-8 px-3 text-xs gap-1 bg-primary hover:bg-primary/90">
                        <ShoppingCart className="h-3 w-3" /> Αγορά
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-square bg-secondary/30">
                <img src={getImage(selectedProduct)} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col">
                <Badge className="w-fit mb-2 bg-primary/20 text-primary border-primary/30 text-[10px]">{selectedProduct.category}</Badge>
                <h2 className="font-display text-xl font-black text-foreground mb-2">{selectedProduct.name}</h2>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{selectedProduct.description}</p>
                {selectedProduct.sizes?.length ? (
                  <div className="mb-4">
                    <p className="text-xs font-display font-bold text-foreground mb-2 uppercase tracking-wider">Μέγεθος</p>
                    <div className="flex gap-2">
                      {selectedProduct.sizes.map(s => (
                        <button key={s} onClick={() => setSelectedSize(s)}
                          className={`h-9 w-12 rounded-lg border text-xs font-bold transition-all ${selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-black text-primary">€{Number(selectedProduct.price).toFixed(2)}</span>
                    {selectedProduct.original_price && <span className="text-sm text-muted-foreground line-through">€{Number(selectedProduct.original_price).toFixed(2)}</span>}
                  </div>
                  <Button disabled={selectedProduct.stock <= 0} onClick={() => {
                    if (selectedProduct.sizes?.length && !selectedSize) { toast({ title: "Επέλεξε μέγεθος!", variant: "destructive" }); return; }
                    addToCart(selectedProduct, selectedSize);
                    setSelectedProduct(null);
                  }} className="gap-2 bg-primary hover:bg-primary/90">
                    <ShoppingCart className="h-4 w-4" /> Προσθήκη
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md bg-card border-border">
          <h2 className="font-display text-xl font-black text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" /> Καλάθι Αγορών
          </h2>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Το καλάθι σου είναι άδειο</p>
          ) : (
            <>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                    <img src={getImage(item.product)} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      {item.size && <p className="text-[10px] text-muted-foreground">Μέγεθος: {item.size}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(idx, -1)} className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-foreground hover:bg-primary/20"><Minus className="h-3 w-3" /></button>
                        <span className="text-xs font-bold text-foreground w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(idx, 1)} className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-foreground hover:bg-primary/20"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeFromCart(idx)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                      <span className="text-sm font-display font-bold text-primary">€{(Number(item.product.price) * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Σύνολο</span>
                  <span className="font-display text-2xl font-black text-primary">€{cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2 font-display" onClick={() => {
                  if (!user) { toast({ title: "Πρέπει να συνδεθείς πρώτα", description: "Κάνε login για να ολοκληρώσεις την αγορά.", variant: "destructive" }); navigate("/auth"); return; }
                  setShowCart(false);
                  setShowCheckout(true);
                  setOrderSuccess(false);
                }}>
                  <ShoppingCart className="h-4 w-4" /> Ολοκλήρωση Αγοράς
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={(v) => { setShowCheckout(v); if (!v) setOrderSuccess(false); }}>
        <DialogContent className="max-w-lg bg-card border-border">
          {orderSuccess ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="font-display text-2xl font-black text-foreground mb-2">Η παραγγελία σου καταχωρήθηκε! 🎉</h2>
              <p className="text-muted-foreground mb-6">Θα λάβεις ενημέρωση για την κατάσταση της παραγγελίας σου.</p>
              <Button onClick={() => { setShowCheckout(false); setOrderSuccess(false); }} className="bg-primary hover:bg-primary/90">Κλείσιμο</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Ολοκλήρωση Παραγγελίας
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {/* Order summary */}
                <div className="rounded-xl bg-secondary/30 border border-border p-3">
                  <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Σύνοψη Παραγγελίας</p>
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-foreground py-1">
                      <span>{item.product.name} {item.size ? `(${item.size})` : ""} × {item.qty}</span>
                      <span className="text-primary font-bold">€{(Number(item.product.price) * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border mt-2">
                    <span>Σύνολο</span>
                    <span className="text-primary font-display">€{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping form */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Ονοματεπώνυμο *</label>
                    <Input value={checkoutForm.full_name} onChange={e => setCheckoutForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Γιάννης Παπαδόπουλος" className="bg-secondary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email *</label>
                    <Input value={checkoutForm.email} onChange={e => setCheckoutForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="bg-secondary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Τηλέφωνο</label>
                    <Input value={checkoutForm.phone} onChange={e => setCheckoutForm(p => ({ ...p, phone: e.target.value }))} placeholder="69xxxxxxxx" className="bg-secondary/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Διεύθυνση *</label>
                    <Input value={checkoutForm.address} onChange={e => setCheckoutForm(p => ({ ...p, address: e.target.value }))} placeholder="Οδός, αριθμός" className="bg-secondary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Πόλη *</label>
                    <Input value={checkoutForm.city} onChange={e => setCheckoutForm(p => ({ ...p, city: e.target.value }))} placeholder="Αθήνα" className="bg-secondary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Τ.Κ. *</label>
                    <Input value={checkoutForm.postal_code} onChange={e => setCheckoutForm(p => ({ ...p, postal_code: e.target.value }))} placeholder="10000" className="bg-secondary/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Σημειώσεις</label>
                    <Textarea value={checkoutForm.notes} onChange={e => setCheckoutForm(p => ({ ...p, notes: e.target.value }))} placeholder="Παρατηρήσεις..." rows={2} className="bg-secondary/50 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowCheckout(false)}>Ακύρωση</Button>
                  <Button onClick={handleCheckout} disabled={submitting} className="bg-primary hover:bg-primary/90 gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Υποβολή Παραγγελίας
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* My Orders Dialog */}
      <Dialog open={showOrders} onOpenChange={setShowOrders}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Οι Παραγγελίες μου
            </DialogTitle>
          </DialogHeader>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Δεν έχεις παραγγελίες ακόμα.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const st = statusLabels[order.status] || statusLabels.pending;
                return (
                  <div key={order.id} className="rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="space-y-1">
                      {(order.shop_order_items || []).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-foreground">
                          <span>{item.product_name} {item.size ? `(${item.size})` : ""} × {item.quantity}</span>
                          <span className="text-primary">€{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("el-GR")}</span>
                      <span className="font-display text-sm font-bold text-primary">€{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Shop;
