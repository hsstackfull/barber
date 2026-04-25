import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getProducts, getCategories } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (category = null) => {
    try {
      const response = await getProducts(category);
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.product_id === product.product_id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Produto adicionado ao carrinho');
    window.dispatchEvent(new Event('storage'));
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-2" data-testid="products-title">PRODUTOS</h1>
              <p className="text-muted-foreground">Produtos profissionais para cuidado masculino</p>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex gap-2 mb-8 flex-wrap">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => filterByCategory(null)}
                data-testid="category-all"
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button 
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => filterByCategory(cat)}
                  data-testid={`category-${cat}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.product_id} data-testid={`product-card-${product.product_id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      {product.stock <= product.low_stock_threshold && (
                        <Badge variant="destructive">Estoque Baixo</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-accent">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-muted-foreground">Estoque: {product.stock} unidades</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      data-testid={`add-to-cart-${product.product_id}`}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stock === 0 ? 'Sem Estoque' : 'Adicionar ao Carrinho'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;