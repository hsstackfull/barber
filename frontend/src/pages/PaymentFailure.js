import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <CardTitle className="text-2xl">Pagamento Não Realizado</CardTitle>
            <CardDescription>
              Houve um problema ao processar seu pagamento. Tente novamente.
            </CardDescription>
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
              <Button className="flex-1" onClick={() => navigate(ref?.startsWith('apt-') ? '/services' : '/cart')}>
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailure;