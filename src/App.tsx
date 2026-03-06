/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User as UserIcon, 
  LogOut, 
  Briefcase, 
  Calendar, 
  MessageSquare,
  ChevronRight,
  Star,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Service, Booking } from './types';
import { cn } from './lib/utils';

// --- Schemas ---
const loginSchema = z.object({
  identifier: z.string().min(1, "E-mail ou CPF é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const verificationSchema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos"),
});

const serviceSchema = z.object({
  title: z.string().min(5, "Título muito curto"),
  description: z.string().min(20, "Descrição deve ser mais detalhada"),
  category: z.string().min(1, "Selecione uma categoria"),
  price: z.coerce.number().min(1, "Preço deve ser maior que zero"),
  priceType: z.enum(['hora', 'dia', 'trabalho']),
  experienceYears: z.coerce.number().min(0, "Experiência não pode ser negativa"),
  workingDays: z.array(z.string()).min(1, "Selecione pelo menos um dia"),
  contactInfo: z.string().min(5, "Informação de contato é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type VerificationData = z.infer<typeof verificationSchema>;
type ServiceData = z.infer<typeof serviceSchema>;

// --- Components ---

const Navbar = ({ user, onLogout, onNavigate, currentPage }: { 
  user: User | null, 
  onLogout: () => void, 
  onNavigate: (page: string) => void,
  currentPage: string 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-amber-400 font-bold">S</div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">Service In</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigate('home')} className={cn("text-sm font-medium transition-colors", currentPage === 'home' ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900")}>Explorar</button>
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate('add-service')} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={14} className="text-amber-400" />
                  Anunciar
                </button>
                <button onClick={() => onNavigate('dashboard')} className={cn("text-sm font-medium transition-colors", currentPage === 'dashboard' ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900")}>Meus Serviços</button>
                <button onClick={() => onNavigate('bookings')} className={cn("text-sm font-medium transition-colors", currentPage === 'bookings' ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900")}>Minhas Contratações</button>
                <div className="flex items-center gap-4 pl-4 border-l border-zinc-200">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-zinc-900">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Usuário Verificado</span>
                  </div>
                  <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('login')} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Entrar</button>
                <button onClick={() => onNavigate('register')} className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all">Criar Conta</button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-zinc-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">Explorar</button>
              {user ? (
                <>
                  <button onClick={() => { onNavigate('add-service'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                    <Plus size={18} className="text-amber-500" />
                    Anunciar Serviço
                  </button>
                  <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">Meus Serviços</button>
                  <button onClick={() => { onNavigate('bookings'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">Minhas Contratações</button>
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Sair</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onNavigate('login'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">Entrar</button>
                  <button onClick={() => { onNavigate('register'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-4 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Criar Conta</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [services, setServices] = useState<Service[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
    fetchServices();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyServices();
      fetchMyBookings();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    if (res.ok) setServices(await res.json());
  };

  const fetchMyServices = async () => {
    const res = await fetch('/api/my-services');
    if (res.ok) setMyServices(await res.json());
  };

  const fetchMyBookings = async () => {
    const res = await fetch('/api/my-bookings');
    if (res.ok) setMyBookings(await res.json());
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCurrentPage('home');
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Navbar user={user} onLogout={handleLogout} onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero */}
              <section className="text-center space-y-6 py-12">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900">
                  Encontre o profissional ideal <br />
                  <span className="text-blue-600 underline decoration-amber-400 decoration-4 underline-offset-8">para o seu próximo projeto.</span>
                </h1>
                <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                  Conectamos talentos locais com pessoas que precisam de serviços de qualidade. 
                  Seguro, rápido e profissional.
                </p>
                <div className="max-w-xl mx-auto relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="O que você está procurando? (ex: Pintor, Designer, Faxina)"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </section>

              {/* Be a Provider CTA */}
              <section className="bg-blue-600 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="space-y-4 text-center md:text-left relative z-10">
                  <h2 className="text-3xl font-bold">Quer oferecer seus serviços?</h2>
                  <p className="text-blue-50 max-w-md">
                    Cadastre-se como prestador e comece a receber solicitações de clientes na sua região hoje mesmo.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (!user) {
                      setCurrentPage('login');
                    } else {
                      setCurrentPage('add-service');
                    }
                  }}
                  className="bg-amber-400 text-blue-900 px-8 py-4 rounded-2xl font-bold hover:bg-amber-300 transition-all whitespace-nowrap shadow-lg relative z-10"
                >
                  {user ? 'Cadastrar meu serviço' : 'Começar agora'}
                </button>
              </section>

              {/* Services Grid */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Serviços Disponíveis</h2>
                  <span className="text-sm text-zinc-500">{filteredServices.length} anúncios encontrados</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onHire={async () => {
                        if (!user) {
                          setCurrentPage('login');
                          return;
                        }
                        const res = await fetch('/api/bookings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ serviceId: service.id })
                        });
                        if (res.ok) {
                          alert('Solicitação enviada com sucesso! O prestador entrará em contato.');
                          fetchMyBookings();
                        }
                      }}
                    />
                  ))}
                </div>
                {filteredServices.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <p className="text-zinc-400">Nenhum serviço encontrado para sua busca.</p>
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {currentPage === 'login' && (
            <AuthForm 
              type="login" 
              onSuccess={(u) => { setUser(u); setCurrentPage('home'); }} 
              onSwitch={() => setCurrentPage('register')} 
            />
          )}

          {currentPage === 'register' && (
            <AuthForm 
              type="register" 
              onSuccess={(u) => { setUser(u); setCurrentPage('home'); }} 
              onSwitch={() => setCurrentPage('login')} 
            />
          )}

          {currentPage === 'dashboard' && user && (
            <Dashboard 
              services={myServices} 
              onAddService={() => setCurrentPage('add-service')} 
              onRefresh={fetchMyServices}
            />
          )}

          {currentPage === 'add-service' && user && (
            <ServiceForm 
              onSuccess={() => { fetchMyServices(); fetchServices(); setCurrentPage('dashboard'); }} 
              onCancel={() => setCurrentPage('dashboard')} 
            />
          )}

          {currentPage === 'bookings' && user && (
            <BookingsList bookings={myBookings} />
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-zinc-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-amber-400 font-bold text-xs">S</div>
            <span className="font-bold">Service In</span>
          </div>
          <p className="text-sm text-zinc-500">© 2026 Service In. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-components ---

function ServiceCard({ service, onHire }: { service: Service, onHire: () => void | Promise<void>, key?: React.Key }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
            {service.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">4.9</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{service.title}</h3>
          <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{service.description}</p>
        </div>

        <div className="flex items-center gap-3 py-4 border-y border-zinc-50">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">{service.providerName}</p>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <ShieldCheck size={10} className="text-blue-500" />
              <span>Identidade Verificada</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{service.experienceYears} anos de experiência</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">A partir de</span>
            <p className="text-xl font-bold text-zinc-900">
              R$ {service.price.toFixed(2)} 
              <span className="text-xs font-normal text-zinc-500 ml-1">/ {service.priceType}</span>
            </p>
          </div>
          <button 
            onClick={onHire}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
          >
            Contratar
          </button>
        </div>

        {service.workingDays && service.workingDays.length > 0 && (
          <div className="pt-3 border-t border-zinc-50">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">Disponibilidade</p>
            <div className="flex flex-wrap gap-1">
              {service.workingDays.map(day => (
                <span key={day} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[9px] font-medium rounded-md">
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AuthForm({ type, onSuccess, onSwitch }: { 
  type: 'login' | 'register', 
  onSuccess: (u: User) => void, 
  onSwitch: () => void 
}) {
  const [error, setError] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(type === 'login' ? loginSchema : registerSchema)
  });

  const { 
    register: registerVerify, 
    handleSubmit: handleSubmitVerify, 
    formState: { errors: errorsVerify, isSubmitting: isSubmittingVerify } 
  } = useForm<any>({
    resolver: zodResolver(verificationSchema)
  });

  const onSubmit = async (data: any) => {
    setError('');
    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        if (type === 'register') {
          setVerifyingEmail(data.email);
        } else {
          onSuccess(result.user);
        }
      } else {
        if (res.status === 403 && result.requiresVerification) {
          setVerifyingEmail(result.email);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    }
  };

  const onVerify = async (data: any) => {
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyingEmail, code: data.code })
      });
      const result = await res.json();
      if (res.ok) {
        onSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao verificar código.');
    }
  };

  if (verifyingEmail) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl mt-12"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold">Verifique seu e-mail</h2>
          <p className="text-sm text-zinc-500">
            Enviamos um código de 6 dígitos para <span className="font-semibold text-zinc-900">{verifyingEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmitVerify(onVerify)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Código de Verificação</label>
            <input 
              {...registerVerify('code')}
              className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center text-2xl font-bold tracking-[10px]"
              placeholder="000000"
              maxLength={6}
            />
            {errorsVerify.code && <p className="text-[10px] text-red-500 ml-1">{errorsVerify.code.message as string}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmittingVerify}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {isSubmittingVerify ? 'Verificando...' : 'Validar Cadastro'}
          </button>
          
          <button 
            type="button"
            onClick={() => setVerifyingEmail(null)}
            className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Voltar
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl mt-12"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">{type === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        <p className="text-sm text-zinc-500">
          {type === 'login' ? 'Acesse sua conta para gerenciar serviços' : 'Comece a oferecer ou contratar serviços hoje'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {type === 'register' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Nome Completo</label>
            <input 
              {...register('name')}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="Ex: João Silva"
            />
            {errors.name && <p className="text-[10px] text-red-500 ml-1">{errors.name.message as string}</p>}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">
            {type === 'login' ? 'E-mail ou CPF' : 'E-mail'}
          </label>
          <input 
            {...register(type === 'login' ? 'identifier' : 'email')}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            placeholder={type === 'login' ? "seu@email.com ou 12345678901" : "seu@email.com"}
          />
          {errors[type === 'login' ? 'identifier' : 'email'] && (
            <p className="text-[10px] text-red-500 ml-1">{errors[type === 'login' ? 'identifier' : 'email']?.message as string}</p>
          )}
        </div>

        {type === 'register' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">CPF (apenas números)</label>
            <input 
              {...register('cpf')}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="12345678901"
              maxLength={11}
            />
            {errors.cpf && <p className="text-[10px] text-red-500 ml-1">{errors.cpf.message as string}</p>}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Senha</label>
          <input 
            {...register('password')}
            type="password"
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password.message as string}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Processando...' : (type === 'login' ? 'Entrar' : 'Criar Conta')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
        <p className="text-sm text-zinc-500">
          {type === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button onClick={onSwitch} className="ml-2 font-bold text-zinc-900 hover:text-blue-600 transition-colors">
            {type === 'login' ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

function Dashboard({ services, onAddService, onRefresh }: { 
  services: Service[], 
  onAddService: () => void,
  onRefresh: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Meus Serviços</h2>
          <p className="text-zinc-500">Gerencie seus anúncios de serviços</p>
        </div>
        <button 
          onClick={onAddService}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} className="text-amber-400" />
          Novo Anúncio
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-200 p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
            <Briefcase size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Nenhum serviço anunciado</h3>
            <p className="text-zinc-500 text-sm">Comece a oferecer seus serviços para a comunidade.</p>
          </div>
          <button onClick={onAddService} className="text-blue-600 font-bold hover:underline decoration-amber-400">Criar meu primeiro anúncio</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{s.category}</span>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-zinc-500">R$ {s.price.toFixed(2)} / {s.priceType} • {s.experienceYears} anos exp.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase">Ativo</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      workingDays: [] as string[],
      priceType: 'trabalho'
    }
  });

  const selectedDays = watch('workingDays') || [];
  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const toggleDay = (day: string) => {
    const current = [...selectedDays];
    const index = current.indexOf(day);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(day);
    }
    setValue('workingDays', current, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) onSuccess();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">Criar Novo Anúncio</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Título do Anúncio</label>
            <input 
              {...register('title')}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="Ex: Pintura Residencial Profissional"
            />
            {errors.title && <p className="text-[10px] text-red-500 ml-1">{errors.title.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Categoria</label>
            <select 
              {...register('category')}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            >
              <option value="">Selecione...</option>
              <option value="Pintura">Pintura</option>
              <option value="Marcenaria">Marcenaria</option>
              <option value="Elétrica">Elétrica</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Construção">Construção</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Design">Design</option>
              <option value="Aulas">Aulas</option>
              <option value="Outros">Outros</option>
            </select>
            {errors.category && <p className="text-[10px] text-red-500 ml-1">{errors.category.message as string}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Descrição Detalhada</label>
          <textarea 
            {...register('description')}
            rows={4}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            placeholder="Descreva o que você oferece, sua experiência e o que está incluso..."
          />
          {errors.description && <p className="text-[10px] text-red-500 ml-1">{errors.description.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Preço (R$)</label>
            <div className="flex gap-2">
              <input 
                {...register('price')}
                type="number"
                step="0.01"
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="0.00"
              />
              <select 
                {...register('priceType')}
                className="w-32 px-2 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="trabalho">/ trabalho</option>
                <option value="hora">/ hora</option>
                <option value="dia">/ dia</option>
              </select>
            </div>
            {errors.price && <p className="text-[10px] text-red-500 ml-1">{errors.price.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Anos de Experiência</label>
            <input 
              {...register('experienceYears')}
              type="number"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="Ex: 5"
            />
            {errors.experienceYears && <p className="text-[10px] text-red-500 ml-1">{errors.experienceYears.message as string}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Contato (WhatsApp/Telefone)</label>
          <input 
            {...register('contactInfo')}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            placeholder="(11) 99999-9999"
          />
          {errors.contactInfo && <p className="text-[10px] text-red-500 ml-1">{errors.contactInfo.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Dias de Atendimento</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  selectedDays.includes(day) 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300"
                )}
              >
                {day}
              </button>
            ))}
          </div>
          {errors.workingDays && <p className="text-[10px] text-red-500 ml-1">{errors.workingDays.message as string}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Anúncio'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function BookingsList({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Minhas Contratações</h2>
        <p className="text-zinc-500">Acompanhe os serviços que você solicitou</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-200 p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Nenhuma contratação realizada</h3>
            <p className="text-zinc-500 text-sm">Explore os serviços disponíveis e contrate um profissional.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{b.serviceTitle}</h3>
                  <p className="text-sm text-zinc-500">Prestador: <span className="font-semibold text-zinc-900">{b.providerName}</span></p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{new Date(b.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Pendente</p>
                </div>
                <a 
                  href={`mailto:${b.providerEmail}`}
                  className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all"
                >
                  <MessageSquare size={18} />
                  Contatar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
