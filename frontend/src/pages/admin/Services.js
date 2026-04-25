import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getServices, createService, updateService, deleteService } from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService && editingService.service_id) {
        await updateService(editingService.service_id, formData);
        toast.success('Serviço atualizado');
      } else {
        await createService(formData);
        toast.success('Serviço criado');
      }
      setEditingService(null);
      setFormData({ name: '', description: '', duration_minutes: 30, price: 0 });
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir?')) {
      try {
        await deleteService(id);
        toast.success('Serviço removido');
        fetchServices();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao excluir');
      }
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar admin /><div className="p-8">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar admin />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-4xl tracking-wide">SERVIÇOS</h1>
          <Button onClick={() => setEditingService({})}>
            <Plus className="mr-2 h-4 w-4" /> Novo Serviço
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.service_id} className="p-6">
              <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              <p className="text-sm mb-1"><strong>Duração:</strong> {service.duration_minutes} min</p>
              <p className="text-xl font-bold text-accent mb-4">{formatCurrency(service.price)}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(service.service_id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={editingService !== null} onOpenChange={() => setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService?.service_id ? 'Editar' : 'Novo'} Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div>
              <Label>Duração (minutos)</Label>
              <Input type="number" required value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Preço (R$)</Label>
              <Input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
