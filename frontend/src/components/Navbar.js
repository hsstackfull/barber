import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Calendar, Settings, ChevronDown, Menu, X, Scissors, LayoutDashboard } from 'lucide-react';

const Navbar = ({ admin = false }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Lê as informações de autenticação do localStorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  // Lê o carrinho do localStorage
  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detecta scroll para mudar aparência do navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha mobile menu ao mudar de rota
  useEffect(() => {
    setIsMobileOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  // Animação de bounce no carrinho
  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setIsAccountOpen(false);
    setIsMobileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/services', label: 'Serviços' },
    { to: '/products', label: 'Produtos' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // ── BARRA DO ADMINISTRADOR ──
  if (admin) {
    return (
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2 text-stone-800">
              <LayoutDashboard size={20} />
              <span className="font-bold text-lg tracking-widest uppercase">Admin</span>
            </Link>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { to: '/admin', label: 'Dashboard' },
                { to: '/admin/appointments', label: 'Agendamentos' },
                { to: '/admin/services', label: 'Serviços' },
                { to: '/admin/products', label: 'Produtos' },
                { to: '/admin/orders', label: 'Pedidos' },
                { to: '/admin/customers', label: 'Clientes' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(to)
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}
                  `}
                >
                  {label}
                </Link>
              ))}
              <div className="w-px h-5 bg-stone-200 mx-1" />
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-stone-200
                           text-stone-700 hover:bg-stone-50 transition-all duration-150"
              >
                Ver Site
              </Link>
              <button
                onClick={handleLogout}
                title="Sair do Painel"
                className="w-8 h-8 rounded-lg flex items-center justify-center
                           text-red-600 border border-red-200 hover:bg-red-50
                           transition-all duration-150"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ── BARRA PÚBLICA ──
  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
            : 'bg-stone-50 border-b border-stone-200'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/logo-santos.png"
                alt="Logo Santos Barbearia"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback para ícone caso a imagem não carregue
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback de ícone (oculto por padrão) */}
              <div
                style={{ display: 'none' }}
                className="w-10 h-10 bg-stone-800 rounded-lg items-center justify-center
                           group-hover:bg-stone-700 transition-colors duration-200"
              >
                <Scissors size={18} className="text-amber-400" />
              </div>
              <span className="hidden sm:block font-bold text-stone-800 text-sm tracking-wide uppercase">
                Santos<span className="text-amber-500">Barbearia</span>
              </span>
            </Link>

            {/* LINKS CENTRO — Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(to)
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* DIREITA — carrinho + conta */}
            <div className="flex items-center gap-2">

              {/* CARRINHO */}
              <Link
                to="/cart"
                className="relative w-9 h-9 rounded-lg border border-stone-200 bg-white
                           flex items-center justify-center text-stone-600
                           hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900
                           transition-all duration-150"
                aria-label="Carrinho de compras"
              >
                <ShoppingCart size={16} className={cartBounce ? 'animate-bounce' : ''} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white
                                   text-[10px] font-bold rounded-full flex items-center justify-center
                                   leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* CONTA / LOGIN — Desktop */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                {!token ? (
                  // Não está logado — botão de login
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                               border border-stone-200 bg-white text-stone-700
                               hover:bg-stone-50 hover:border-stone-300 transition-all duration-150"
                  >
                    <User size={15} />
                    Fazer Login
                  </Link>
                ) : (
                  // Está logado — dropdown de conta
                  <>
                    <button
                      onClick={() => setIsAccountOpen((prev) => !prev)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                        border transition-all duration-150 select-none
                        ${isAccountOpen
                          ? 'bg-stone-100 border-stone-300 text-stone-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'}
                      `}
                      aria-expanded={isAccountOpen}
                      aria-haspopup="true"
                    >
                      <User size={15} />
                      <span className="max-w-[120px] truncate">
                        {userName ? `Olá, ${userName.split(' ')[0]}` : 'A Minha Conta'}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 text-stone-400
                          ${isAccountOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>

                    {/* DROPDOWN */}
                    {isAccountOpen && (
                      <div
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-stone-200
                                    shadow-lg shadow-stone-200/60 overflow-hidden
                                    animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        {(userName || userEmail) && (
                          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                            <p className="text-xs text-stone-400 leading-none mb-1">Conectado como</p>
                            {userName && <p className="text-sm font-semibold text-stone-800 truncate">{userName}</p>}
                            {userEmail && <p className="text-xs text-stone-400 truncate">{userEmail}</p>}
                          </div>
                        )}

                        <div className="py-1">
                          {role === 'admin' && (
                            <DropdownItem
                              to="/admin"
                              icon={<LayoutDashboard size={15} />}
                              label="Painel Admin"
                              onClick={() => setIsAccountOpen(false)}
                            />
                          )}
                          <DropdownItem to="/perfil" icon={<User size={15} />} label="Meu Perfil" onClick={() => setIsAccountOpen(false)} />
                          <DropdownItem to="/agendamentos" icon={<Calendar size={15} />} label="Meus Agendamentos" onClick={() => setIsAccountOpen(false)} />
                          <DropdownItem to="/configuracoes" icon={<Settings size={15} />} label="Configurações" onClick={() => setIsAccountOpen(false)} />
                        </div>

                        <div className="border-t border-stone-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-red-600 hover:bg-red-50 transition-colors duration-100"
                          >
                            <LogOut size={15} />
                            Terminar Sessão
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* HAMBURGER — Mobile */}
              <button
                onClick={() => setIsMobileOpen((prev) => !prev)}
                className="md:hidden w-9 h-9 rounded-lg border border-stone-200 bg-white
                           flex items-center justify-center text-stone-600
                           hover:bg-stone-50 transition-all duration-150"
                aria-label="Menu"
              >
                {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 shadow-lg">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100
                    ${isActive(to)
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="px-4 pb-4 pt-1 border-t border-stone-100 space-y-1">
              {!token ? (
                // Não está logado
                <MobileMenuItem to="/login" icon={<User size={15} />} label="Fazer Login" />
              ) : (
                // Está logado
                <>
                  {role === 'admin' && (
                    <MobileMenuItem to="/admin" icon={<LayoutDashboard size={15} />} label="Painel Admin" />
                  )}
                  <MobileMenuItem to="/perfil" icon={<User size={15} />} label="Meu Perfil" />
                  <MobileMenuItem to="/agendamentos" icon={<Calendar size={15} />} label="Meus Agendamentos" />
                  <MobileMenuItem to="/configuracoes" icon={<Settings size={15} />} label="Configurações" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                               text-red-600 hover:bg-red-50 transition-colors duration-100"
                  >
                    <LogOut size={15} />
                    Terminar Sessão
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* SPACER — compensa o fixed navbar */}
      <div className="h-16" />
    </>
  );
};

/* ── Sub-componentes ── */

const DropdownItem = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700
               hover:bg-stone-50 hover:text-stone-900 transition-colors duration-100"
  >
    <span className="text-stone-400">{icon}</span>
    {label}
  </Link>
);

const MobileMenuItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-stone-700
               hover:bg-stone-50 hover:text-stone-900 transition-colors duration-100"
  >
    <span className="text-stone-400">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
