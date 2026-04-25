import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Card } from '../../components/ui/card';
import { getAppointments, updateAppointmentStatus } from '../../lib/api';
import { formatDateTime, formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending_payment: 'secondary',
      confirmed: 'default',
      completed: 'success',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <div className="min-h-screen"><Navbar admin /><div className="p-8">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar admin />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide mb-8">AGENDAMENTOS</h1>
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.appointment_id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{apt.customer_name}</h3>
                  <p className="text-sm text-muted-foreground">{apt.customer_email} | {apt.customer_phone}</p>
                  <p className="mt-2">{apt.service_name}</p>
                  <p className="text-sm">{formatDateTime(apt.appointment_date)}</p>
                  <p className="font-bold text-accent mt-2">{formatCurrency(apt.price)}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(apt.status)}
                  {apt.status === 'confirmed' && (
                    <Button size="sm" onClick={() => updateStatus(apt.appointment_id, 'completed')}>
                      Marcar Completo
                    </Button>
                  )}
                  {apt.status === 'pending_payment' && (
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(apt.appointment_id, 'cancelled')}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Appointments;