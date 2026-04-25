import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getProducts, createProduct, updateProduct, adjustStock } from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit, Package } from 'lucide-react';
import { toast } from 'sonner';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    low_stock_threshold: 5,
    category: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct?.product_id) {
        await updateProduct(editingProduct.product_id, formData);
        toast.success('Produto atualizado');
      } else {
        await createProduct(formData);
        toast.success('Produto criado');
      }
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: 0, stock: 0, low_stock_threshold: 5, category: '' });
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
      category: product.category
    });
  };

  const handleStockAdjust = async (id, adjustment) => {
    try {
      await adjustStock(id, adjustment);
      toast.success('Estoque atualizado');
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao ajustar estoque');
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar admin /><div className="p-8">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar admin />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-4xl tracking-wide">PRODUTOS</h1>
          <Button onClick={() => setEditingProduct({})}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.product_id} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                {product.stock <= product.low_stock_threshold && (
                  <Badge variant="destructive">Baixo</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
              <p className="text-sm mb-4">{product.description}</p>
              <p className="text-xl font-bold text-accent mb-2">{formatCurrency(product.price)}</p>
              <p className="text-sm mb-4"><strong>Estoque:</strong> {product.stock} un</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleStockAdjust(product.product_id, 10)}>
                  +10
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleStockAdjust(product.product_id, -1)}>
                  -1
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={editingProduct !== null} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct?.product_id ? 'Editar' : 'Novo'} Produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} />
              </div>
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;