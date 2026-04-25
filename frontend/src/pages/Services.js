import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getServices, createAppointment, getAvailableSlots } from '../lib/api';
import { formatCurrency } from '../lib/utils';

// Novos imports para o Calendário Visual
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { toast } from 'sonner';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    appointment_date: '',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await getAvailableSlots(date, selectedService.service_id);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Erro ao carregar horários');
    }
  };

  // Nova função para lidar com o clique no calendário
  const handleDateSelect = (date) => {
    if (date) {
      // Formata a data para YYYY-MM-DD corretamente para evitar problemas de fuso horário
      const dateString = format(date, 'yyyy-MM-dd');
      setBookingDate(dateString);
      fetchAvailableSlots(dateString);
      setSelectedSlot(''); // Limpa o horário se mudar a data
    } else {
      setBookingDate('');
      setAvailableSlots([]);
      setSelectedSlot('');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot || !bookingDate) {
      toast.error('Selecione data e horário');
      return;
    }

    const appointmentDateTime = new Date(`${bookingDate}T${selectedSlot}:00`);
    
    try {
      const response = await createAppointment({
        ...formData,
        service_id: selectedService.service_id,
        appointment_date: appointmentDateTime.toISOString()
      });
      
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-4" data-testid="services-title">NOSSOS SERVIÇOS</h1>
          <p className="text-muted-foreground mb-8">Escolha o serviço ideal para você</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.service_id} data-testid={`service-card-${service.service_id}`}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Duração:</strong> {service.duration_minutes} minutos</p>
                    <p className="text-2xl font-bold text-accent">{formatCurrency(service.price)}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedService(service);
                      setBookingDate('');
                      setAvailableSlots([]);
                      setSelectedSlot('');
                    }}
                    data-testid={`book-service-${service.service_id}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Agendar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar {selectedService?.name}</DialogTitle>
            <DialogDescription>
              Preencha seus dados e escolha o horário
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input 
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                data-testid="input-name"
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label>Telefone</Label>
              <Input 
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                data-testid="input-phone"
              />
            </div>
            
            {/* NOVO CAMPO DE DATA COM CALENDÁRIO VISUAL */}
            <div className="flex flex-col space-y-2">
              <Label>Data do Agendamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!bookingDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate 
                      ? format(new Date(bookingDate + 'T00:00:00'), "PPP", { locale: ptBR }) 
                      : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookingDate ? new Date(bookingDate + 'T00:00:00') : undefined}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Não permite agendar no passado
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {availableSlots.length > 0 && (
              <div>
                <Label>Horário Disponível</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={selectedSlot === slot ? 'default' : 'outline'}
                      onClick={() => setSelectedSlot(slot)}
                      data-testid={`slot-${slot}`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {bookingDate && availableSlots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum horário disponível para esta data.
              </p>
            )}
            
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                data-testid="input-notes"
              />
            </div>
            
            <Button type="submit" className="w-full" data-testid="submit-booking" disabled={!selectedSlot || !bookingDate}>
              Confirmar e Pagar {formatCurrency(selectedService?.price || 0)}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Services;
