import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

const PaymentSuccess = ({ pending = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {pending ? (
              <>
                <Clock className="h-16 w-16 mx-auto text-warning mb-4" />
                <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
                <CardDescription>
                  Seu pagamento está sendo processado. Você receberá confirmação por email.
                </CardDescription>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
                <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
                <CardDescription>
                  {ref?.startsWith('apt-') 
                    ? 'Seu agendamento foi confirmado. Você receberá um email com os detalhes.'
                    : 'Seu pedido foi confirmado. Você receberá um email com os detalhes.'}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {ref && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Referência</p>
                <p className="font-mono font-semibold">{ref}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                Voltar ao Início
              </Button>
              <Button className="flex-1" onClick={() => navigate(ref?.startsWith('apt-') ? '/services' : '/products')}>
                {ref?.startsWith('apt-') ? 'Novo Agendamento' : 'Continuar Comprando'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;