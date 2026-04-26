import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Scissors, CheckCircle2, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'https://barber0.onrender.com';

/* ── Validações ── */
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => ({
  length: password.length >= 6,
  hasLetter: /[a-zA-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
});

/* ── Indicador de força da senha ── */
const PasswordStrength = ({ password }) => {
  const rules = validatePassword(password);
  const passed = Object.values(rules).filter(Boolean).length;

  const bars = [
    { color: 'bg-red-500', label: 'Fraca' },
    { color: 'bg-amber-400', label: 'Média' },
    { color: 'bg-green-500', label: 'Forte' },
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3 px-1">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300
                ${i <= passed ? bars[passed - 1]?.color : 'bg-stone-700'}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold tracking-wide ${
          passed === 1 ? 'text-red-400' : passed === 2 ? 'text-amber-400' : passed === 3 ? 'text-green-400' : 'text-stone-600'
        }`}>
          {bars[passed - 1]?.label || ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {[
          { key: 'length', label: 'Mínimo 6 caracteres' },
          { key: 'hasLetter', label: 'Contém uma letra' },
          { key: 'hasNumber', label: 'Contém um número' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            {rules[key]
              ? <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
              : <XCircle size={11} className="text-stone-600 flex-shrink-0" />}
            <span className={`text-xs ${rules[key] ? 'text-stone-400' : 'text-stone-600'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Campo de input ── */
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

/* ── Tela de sucesso ── */
const SuccessScreen = () => (
  <div
    className="min-h-screen flex items-center justify-center p-6"
    style={{
      background: 'radial-gradient(ellipse at 20% 50%, #1c1917 0%, #0c0a09 60%, #1c1917 100%)',
    }}
  >
    <div className="text-center space-y-6 max-w-sm">
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-stone-800 border border-green-500/40 rounded-full flex items-center justify-center">
          <CheckCircle size={36} className="text-green-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h2
          className="text-3xl font-black text-white"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Conta criada!
        </h2>
        <p className="text-stone-400 text-sm">
          Bem-vindo à Santos Barbearia. Redirecionando para o login...
        </p>
      </div>
      <div className="w-full h-[2px] bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{ animation: 'progress 2s linear forwards' }}
        />
      </div>
      <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  </div>
);

/* ── Componente principal ── */
const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim() || form.name.trim().length < 3)
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres.';
    if (!validateEmail(form.email))
      newErrors.email = 'Insira um e-mail válido.';
    const pw = validatePassword(form.password);
    if (!pw.length || !pw.hasLetter || !pw.hasNumber)
      newErrors.password = 'A senha não cumpre os requisitos mínimos.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Conta criada com sucesso!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorData = await response.json().catch(() => null);
        const msg = errorData?.detail || 'Erro ao criar conta. Tente novamente.';
        toast.error(msg);
        if (msg.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, email: 'Este e-mail já está em uso.' }));
        }
      }
    } catch {
      toast.error('Erro de conexão. Verifique a sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) return <SuccessScreen />;

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'radial-gradient(ellipse at 80% 50%, #1c1917 0%, #0c0a09 60%, #1c1917 100%)',
      }}
    >
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden flex items-center gap-3">
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
              Criar conta
            </h2>
            <p className="text-stone-500 text-sm">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-150"
              >
                Fazer login
              </Link>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            <Field
              id="name"
              label="Nome Completo"
              type="text"
              placeholder="João da Silva"
              value={form.name}
              onChange={set('name')}
              disabled={isLoading}
              icon={<User size={15} />}
              error={errors.name}
            />

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

            <div>
              <Field
                id="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crie uma senha forte"
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
              <PasswordStrength password={form.password} />
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
                relative overflow-hidden group mt-2
              "
            >
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Cadastrar
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-600 leading-relaxed">
            Ao criar uma conta, concorda com os nossos{' '}
            <span className="text-stone-400 hover:text-amber-400 cursor-pointer transition-colors">Termos de Serviço</span>
            {' '}e{' '}
            <span className="text-stone-400 hover:text-amber-400 cursor-pointer transition-colors">Política de Privacidade</span>.
          </p>
        </div>
      </div>

      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #292524 0%, #1c1917 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #d6d3d1 40px, #d6d3d1 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #d6d3d1 40px, #d6d3d1 41px)',
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-amber-500/10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-amber-500/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Scissors size={18} className="text-stone-900" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm">
              Santos<span className="text-amber-500">Barbearia</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="w-12 h-[2px] bg-amber-500" />
            <h2
              className="text-4xl font-black text-white leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              A sua experiência começa{' '}
              <span className="text-amber-400">aqui.</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Agendamento online', desc: 'Marque o seu serviço em segundos, a qualquer hora.' },
              { title: 'Histórico completo', desc: 'Consulte todos os seus cortes e compras anteriores.' },
              { title: 'Ofertas exclusivas', desc: 'Acesso antecipado a promoções e novos serviços.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-stone-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-stone-600 text-xs">© 2025 Santos Barbearia. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
