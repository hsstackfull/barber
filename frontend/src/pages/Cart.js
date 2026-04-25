import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { formatCurrency } from '../lib/utils';
import { createOrder } from '../lib/api';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });

  useEffect(() => {
    loadCart();
    
    const handleStorageChange = () => {
      loadCart();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  };

  const updateQuantity = (productId, delta) => {
    const updated = cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: Math.min(newQty, item.stock) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cart.filter(item => item.product_id !== productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    toast.success('Produto removido');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    const orderItems = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }));

    try {
      const response = await createOrder({
        ...formData,
        items: orderItems
      });
      
      if (response.data.payment_url) {
        localStorage.removeItem('cart');
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar pedido');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-8" data-testid="cart-title">CARRINHO</h1>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
              <Button onClick={() => navigate('/products')}>Ver Produtos</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="md:col-span-2 space-y-4">
                {cart.map((item) => (
                  <Card key={item.product_id} data-testid={`cart-item-${item.product_id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <p className="text-lg font-bold text-accent mt-2">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline"
                              onClick={() => updateQuantity(item.product_id, -1)}
                              data-testid={`decrease-qty-${item.product_id}`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold" data-testid={`qty-${item.product_id}`}>
                              {item.quantity}
                            </span>
                            <Button 
                              size="icon" 
                              variant="outline"
                              onClick={() => updateQuantity(item.product_id, 1)}
                              data-testid={`increase-qty-${item.product_id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button 
                            size="icon" 
                            variant="destructive"
                            onClick={() => removeItem(item.product_id)}
                            data-testid={`remove-item-${item.product_id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Checkout Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Finalizar Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCheckout} className="space-y-4">
                      <div>
                        <Label>Nome</Label>
                        <Input 
                          required
                          value={formData.customer_name}
                          onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                          data-testid="checkout-name"
                        />
                      </div>
                      
                      <div>
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          required
                          value={formData.customer_email}
                          onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                          data-testid="checkout-email"
                        />
                      </div>
                      
                      <div>
                        <Label>Telefone</Label>
                        <Input 
                          required
                          value={formData.customer_phone}
                          onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                          data-testid="checkout-phone"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-accent" data-testid="total-amount">
                            {formatCurrency(calculateTotal())}
                          </span>
                        </div>
                        
                        <Button type="submit" className="w-full" data-testid="submit-order">
                          Finalizar e Pagar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;