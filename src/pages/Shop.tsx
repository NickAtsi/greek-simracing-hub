import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, Eye, Heart, X, Plus, Minus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

import tshirtBlack from "@/assets/shop/tshirt-black.png";
import tshirtWhite from "@/assets/shop/tshirt-white.png";
import keychainHelmet from "@/assets/shop/keychain-helmet.png";
import keychainWheel from "@/assets/shop/keychain-wheel.png";
import hoodieNavy from "@/assets/shop/hoodie-navy.png";
import capBlue from "@/assets/shop/cap-blue.png";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  sizes?: string[];
}

const products: Product[] = [
  {
    id: "1", name: "GSR Racing Tee — Black Edition", description: "Premium μαύρο t-shirt με το iconic Sim Racing logo. 100% βαμβάκι, racing-inspired design με checkered flag pattern.",
    price: 29.99, originalPrice: 39.99, image: tshirtBlack, category: "Ρούχα", badge: "Bestseller", rating: 4.8, reviews: 124, sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "2", name: "GSR Racing Tee — White Edition", description: "Λευκό t-shirt με μπλε accents και modern motorsport design. Ελαφρύ, αναπνεύσιμο ύφασμα.",
    price: 29.99, image: tshirtWhite, category: "Ρούχα", rating: 4.7, reviews: 89, sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "3", name: "GSR Team Hoodie — Navy", description: "Ζεστό hoodie με racing sponsors style. Fleece-lined, ιδανικό για μαραθώνιες sessions.",
    price: 54.99, originalPrice: 69.99, image: hoodieNavy, category: "Ρούχα", badge: "Νέο", rating: 4.9, reviews: 56, sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "4", name: "GSR Racing Cap", description: "Snapback cap με κεντημένο Sim Racing logo. One-size-fits-all, premium ποιότητα.",
    price: 19.99, image: capBlue, category: "Αξεσουάρ", rating: 4.6, reviews: 203
  },
  {
    id: "5", name: "Helmet Keychain — Blue Chrome", description: "Μεταλλικό μπρελόκ σε σχήμα κράνους racing. Premium chrome finish με μπλε λεπτομέρειες.",
    price: 12.99, image: keychainHelmet, category: "Μπρελόκ", badge: "Popular", rating: 4.5, reviews: 312
  },
  {
    id: "6", name: "Steering Wheel Keychain", description: "Μπρελόκ τιμονιού sim racing. Ατσάλινο με μπλε enamel accents και spinning wheel.",
    price: 14.99, originalPrice: 19.99, image: keychainWheel, category: "Μπρελόκ", badge: "-25%", rating: 4.7, reviews: 178
  },
];

const categories = ["Όλα", "Ρούχα", "Αξεσουάρ", "Μπρελόκ"];

const Shop = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("Όλα");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number; size?: string }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
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

      {/* Category Filters & Cart Button */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-racing"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button onClick={() => setShowCart(true)} className="gap-2 relative bg-primary hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4" /> Καλάθι
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-20">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-secondary/30">
                  <motion.img
                    src={product.image} alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedProduct(product); setSelectedSize(""); }}
                        className="bg-card/80 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Προβολή
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button size="sm" variant="outline" onClick={() => toggleFavorite(product.id)}
                        className={`bg-card/80 backdrop-blur-sm border-border ${favorites.has(product.id) ? "text-red-500" : ""}`}>
                        <Heart className={`h-3.5 w-3.5 ${favorites.has(product.id) ? "fill-current" : ""}`} />
                      </Button>
                    </motion.div>
                  </div>
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-display font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-glow">
                      {product.badge}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{product.category}</p>
                  <h3 className="font-display text-sm font-bold text-foreground mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-black text-primary">€{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">€{product.originalPrice}</span>
                      )}
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" onClick={() => product.sizes ? (setSelectedProduct(product), setSelectedSize("")) : addToCart(product)}
                        className="h-8 px-3 text-xs gap-1 bg-primary hover:bg-primary/90">
                        <ShoppingCart className="h-3 w-3" /> Αγορά
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-square bg-secondary/30">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col">
                <Badge className="w-fit mb-2 bg-primary/20 text-primary border-primary/30 text-[10px]">{selectedProduct.category}</Badge>
                <h2 className="font-display text-xl font-black text-foreground mb-2">{selectedProduct.name}</h2>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(selectedProduct.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{selectedProduct.rating} ({selectedProduct.reviews} κριτικές)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{selectedProduct.description}</p>
                {selectedProduct.sizes && (
                  <div className="mb-4">
                    <p className="text-xs font-display font-bold text-foreground mb-2 uppercase tracking-wider">Μέγεθος</p>
                    <div className="flex gap-2">
                      {selectedProduct.sizes.map(s => (
                        <button key={s} onClick={() => setSelectedSize(s)}
                          className={`h-9 w-12 rounded-lg border text-xs font-bold transition-all ${
                            selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-black text-primary">€{selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">€{selectedProduct.originalPrice}</span>
                    )}
                  </div>
                  <Button onClick={() => {
                    if (selectedProduct.sizes && !selectedSize) { toast({ title: "Επέλεξε μέγεθος!", variant: "destructive" }); return; }
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

      {/* Cart Drawer */}
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
                    <img src={item.product.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      {item.size && <p className="text-[10px] text-muted-foreground">Μέγεθος: {item.size}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(idx, -1)} className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-foreground hover:bg-primary/20">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold text-foreground w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(idx, 1)} className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-foreground hover:bg-primary/20">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeFromCart(idx)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-display font-bold text-primary">€{(item.product.price * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Σύνολο</span>
                  <span className="font-display text-2xl font-black text-primary">€{cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2 font-display" onClick={() => toast({ title: "Σύντομα κοντά σας! 🚀", description: "Η ολοκλήρωση αγοράς θα είναι διαθέσιμη σύντομα." })}>
                  <ShoppingCart className="h-4 w-4" /> Ολοκλήρωση Αγοράς
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Shop;
