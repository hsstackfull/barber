import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Scissors } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'https://barber0.onrender.com';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Field = ({ id, label, type, placeholder, value, onChange, disabled, icon, error, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold tracking-widest uppercase text-stone-400">
      {label}
    </label>
    <div className="relative group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none transition-colors group-focus-within:text-amber-500">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full pl-11 pr-4 py-3.5 text-sm bg-stone-900 text-white
          placeholder-stone-600 border rounded-xl outline-none
          transition-all duration-200
          focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? 'border-red-500/70' : 'border-stone-700 hover:border-stone-600'}
        `}
      />
      {children}
    </div>
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
        <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = 'Insira um e-mail válido.';
    if (!form.password || form.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userRole', data.role || 'client');
        if (data.name) localStorage.setItem('userName', data.name);
        if (data.email) localStorage.setItem('userEmail', data.email);

        toast.success('Bem-vindo de volta!');
        
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const msg = data?.detail || 'E-mail ou senha incorretos.';
        toast.error(msg);
        setErrors({ password: 'Credenciais inválidas. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      toast.error('Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, #1c1917 0%, #0c0a09 60%, #1c1917 100%)',
      }}
    >
      {/* Painel lateral decorativo */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #292524 0%, #1c1917 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #d6d3d1 40px, #d6d3d1 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #d6d3d1 40px, #d6d3d1 41px)',
          }}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-amber-500/10" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-amber-500/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Scissors size={18} className="text-stone-900" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm">
              Santos<span className="text-amber-500">Barbearia</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-12 h-[2px] bg-amber-500" />
          <h1
            className="text-5xl font-black text-white leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Estilo é uma
            <br />
            <span className="text-amber-400">arte.</span>
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Agende os seus serviços, acompanhe os seus pedidos e gerencie a sua conta numa só plataforma.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-stone-600 text-xs">© 2025 Santos Barbearia. Todos os direitos reservados.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <Scissors size={16} className="text-stone-900" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm">
              Santos<span className="text-amber-500">Barbearia</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2
              className="text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Bem-vindo de volta
            </h2>
            <p className="text-stone-500 text-sm">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-150"
              >
                Criar agora
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <Field
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={set('email')}
              disabled={isLoading}
              icon={<Mail size={15} />}
              error={errors.email}
            />

            <Field
              id="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              disabled={isLoading}
              icon={<Lock size={15} />}
              error={errors.password}
            >
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>

            <div className="text-right -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs text-stone-500 hover:text-amber-400 transition-colors duration-150"
              >
                Esqueci a minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-4 bg-amber-500 text-stone-900 text-sm font-bold
                rounded-xl tracking-widest uppercase
                hover:bg-amber-400 active:scale-[0.98]
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-3
                relative overflow-hidden group
              "
            >
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-xs text-stone-600 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          <p className="text-center text-sm text-stone-500">
            Novo por aqui?{' '}
            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-150"
            >
              Crie a sua conta gratuitamente →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
