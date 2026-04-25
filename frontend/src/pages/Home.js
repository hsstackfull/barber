import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Scissors, ShoppingBag, Clock, Award } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // Efeito para fazer o carrossel girar sozinho
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        // Se chegou no final do carrossel, volta suavemente para o começo
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Se não, rola para a próxima foto (aprox. a largura do card + espaço)
          carouselRef.current.scrollBy({ left: 374, behavior: 'smooth' });
        }
      }
    }, 3500); // 3500 milissegundos = gira a cada 3.5 segundos

    // Limpa o intervalo se o usuário sair da página
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 hero-gradient">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wide mb-6" data-testid="hero-title">
            ESTILO PREMIUM
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cortes modernos, atendimento profissional e produtos de qualidade.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate('/services')}
              data-testid="cta-agendar"
            >
              Agendar Horário
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => navigate('/products')}
              data-testid="cta-produtos"
            >
              Ver Produtos
            </Button>
          </div>
        </div>
      </section>

      {/* --- INÍCIO DO CARROSSEL DE FOTOS --- */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display tracking-wider mb-2">NOSSO ESPAÇO & TRABALHOS</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>
          
          {/* Container do Carrossel com Ref para rolar sozinho */}
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 scroll-smooth" 
            style={{ scrollbarWidth: 'none' }}
          >
            
            {/* Foto 1 */}
            <div className="group snap-center shrink-0 w-[85vw] sm:w-[350px] rounded-2xl overflow-hidden shadow-xl border border-border/50 cursor-pointer">
              <div className="overflow-hidden">
                <img 
                  src="/carrossel-1.jpg" 
                  alt="Corte Moderno" 
                  className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
            </div>

            {/* Foto 2 */}
            <div className="group snap-center shrink-0 w-[85vw] sm:w-[350px] rounded-2xl overflow-hidden shadow-xl border border-border/50 cursor-pointer">
              <div className="overflow-hidden">
                <img 
                  src="/carrossel-2.jpg" 
                  alt="Barboterapia" 
                  className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
            </div>

            {/* Foto 3 */}
            <div className="group snap-center shrink-0 w-[85vw] sm:w-[350px] rounded-2xl overflow-hidden shadow-xl border border-border/50 cursor-pointer">
              <div className="overflow-hidden">
                <img 
                  src="/carrossel-3.jpg" 
                  alt="Nosso Espaço" 
                  className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
            </div>

            {/* Foto 4 */}
            <div className="group snap-center shrink-0 w-[85vw] sm:w-[350px] rounded-2xl overflow-hidden shadow-xl border border-border/50 cursor-pointer">
              <div className="overflow-hidden">
                <img 
                  src="/carrossel-4.jpg" 
                  alt="Produtos" 
                  className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* --- FIM DO CARROSSEL DE FOTOS --- */}

      {/* Features */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <Scissors className="h-12 w-12 mx-auto mb-4 text-accent transition-transform group-hover:-rotate-12" />
              <h3 className="font-semibold text-lg mb-2">Cortes Modernos</h3>
              <p className="text-sm text-muted-foreground">Estilos atualizados e clássicos</p>
            </div>
            <div className="text-center group">
              <Award className="h-12 w-12 mx-auto mb-4 text-accent transition-transform group-hover:scale-110" />
              <h3 className="font-semibold text-lg mb-2">Profissionais</h3>
              <p className="text-sm text-muted-foreground">Barbeiros experientes</p>
            </div>
            <div className="text-center group">
              <Clock className="h-12 w-12 mx-auto mb-4 text-accent transition-transform group-hover:scale-110" />
              <h3 className="font-semibold text-lg mb-2">Agendamento Fácil</h3>
              <p className="text-sm text-muted-foreground">Reserve seu horário online</p>
            </div>
            <div className="text-center group">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-accent transition-transform group-hover:scale-110" />
              <h3 className="font-semibold text-lg mb-2">Produtos Premium</h3>
              <p className="text-sm text-muted-foreground">Cuidado profissional em casa</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
