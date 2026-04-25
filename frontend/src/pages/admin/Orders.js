import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getOrders, updateOrderStatus } from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { formatCurrency, formatDateTime } from '../../lib/utils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar admin /><div className="p-8">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar admin />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide mb-8">PEDIDOS</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.order_id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                    <Badge>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {order.customer_email} | {order.customer_phone}
                  </p>
                  <div className="space-y-1 mb-4">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm">
                        {item.quantity}x {item.product_name} - {formatCurrency(item.subtotal)}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-2xl font-bold text-accent">{formatCurrency(order.total)}</p>
                  {order.status === 'paid' && (
                    <Button size="sm" onClick={() => updateStatus(order.order_id, 'processing')}>
                      Em Processamento
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button size="sm" onClick={() => updateStatus(order.order_id, 'shipped')}>
                      Enviado
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

export default Orders;