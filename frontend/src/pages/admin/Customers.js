import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getCustomers } from '../../lib/api';
import { Card } from '../../components/ui/card';
import { formatCurrency, formatDateTime } from '../../lib/utils';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar admin /><div className="p-8">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar admin />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide mb-8">CLIENTES</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer, idx) => (
            <Card key={idx} className="p-6">
              <h3 className="font-semibold text-lg mb-1">{customer.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{customer.email}</p>
              <p className="text-sm mb-2">{customer.phone}</p>
              <div className="space-y-1 text-sm">
                <p><strong>Visitas:</strong> {customer.visit_count}</p>
                <p><strong>Pedidos:</strong> {customer.order_count}</p>
                <p className="text-accent font-semibold"><strong>Total:</strong> {formatCurrency(customer.total_spent)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Última atividade: {formatDateTime(customer.last_activity)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Customers;