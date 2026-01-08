
import React, { useState } from 'react';
import Header from './components/Header';
import AIConcierge from './components/AIConcierge';
import CalendarView from './components/CalendarView';
import BookingForm from './components/BookingForm';
import ManagementView from './components/ManagementView';
import LoginModal from './components/LoginModal';
import { SiteConfig, BookingDetail, DayConfig } from './types';

type ViewState = 'calendar' | 'form' | 'success' | 'admin';

const INITIAL_CONFIG: SiteConfig = {
  globalLimitPerDay: 50,
  ageTiers: [
    { id: 't1', label: '0 a 5 anos', minAge: 0, maxAge: 5, price: 0 },
    { id: 't2', label: '6 a 10 anos', minAge: 6, maxAge: 10, price: 8 },
    { id: 't3', label: 'Acima de 11 anos', minAge: 11, maxAge: null, price: 15 },
  ],
  days: {} 
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('calendar');
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [bookingDate, setBookingDate] = useState<{ day: number; month: string; fullDate: string } | null>(null);
  const [lastBooking, setLastBooking] = useState<BookingDetail | null>(null);
  const [identifiedCpf, setIdentifiedCpf] = useState<string>('');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const allPreviousBookings = (Object.values(config.days) as DayConfig[]).flatMap(day => day.bookings || []);

  const handleDateSelected = (day: number, month: string) => {
    const fullDate = `2024-07-${day.toString().padStart(2, '0')}`;
    setBookingDate({ day, month, fullDate });
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setView('calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (bookingData: Omit<BookingDetail, 'id' | 'timestamp' | 'date'>) => {
    if (!bookingDate) return;

    setIdentifiedCpf(bookingData.cpf);

    const dateKey = bookingDate.fullDate;
    const currentDayConfig = config.days[dateKey] || { 
      isBlocked: false, 
      limit: config.globalLimitPerDay, 
      currentBookings: 0,
      bookings: []
    };

    const newBooking: BookingDetail = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: dateKey,
      paid: false
    };

    const updatedConfig = {
      ...config,
      days: {
        ...config.days,
        [dateKey]: {
          ...currentDayConfig,
          currentBookings: currentDayConfig.currentBookings + bookingData.totalGuests,
          bookings: [...(currentDayConfig.bookings || []), newBooking]
        }
      }
    };

    setConfig(updatedConfig);
    setLastBooking(newBooking);
    setView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAdmin = () => {
    if (view === 'admin') {
      setView('calendar');
    } else {
      if (isAuthenticated) {
        setView('admin');
      } else {
        setShowLoginModal(true);
      }
    }
  };

  const handleLoginSuccess = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setView('admin');
    }
  };

  const calculateTotalPrice = (booking: BookingDetail) => {
    return config.ageTiers.reduce((acc, tier) => {
      const count = booking.guestBreakdown[tier.id] || 0;
      return acc + (count * tier.price);
    }, 0);
  };

  const handleWhatsAppShare = () => {
    if (!lastBooking || !bookingDate) return;

    const totalPrice = calculateTotalPrice(lastBooking).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const whatsappNumber = "5516981394818";
    
    let breakdownText = "";
    config.ageTiers.forEach(tier => {
      const count = lastBooking.guestBreakdown[tier.id] || 0;
      if (count > 0) {
        breakdownText += `\n- *${count}x* ${tier.label}`;
      }
    });

    const message = encodeURIComponent(
      `*SOLICITAÇÃO DE RESERVA - VISTA ALEGRE*\n\n` +
      `✅ *Reserva:* #${lastBooking.id}\n\n` +
      `👤 *Responsável:* ${lastBooking.name}\n` +
      `📅 *Data:* ${bookingDate.day} de ${bookingDate.month} de 2024\n` +
      `👥 *Visitantes:* ${lastBooking.totalGuests}\n` +
      `${breakdownText}\n\n` +
      `💰 *Valor Total:* R$ ${totalPrice}\n\n` +
      `_Olá! Acabei de solicitar meu Day Use pelo site. Gostaria de receber os dados do PIX para efetuar o pagamento e confirmar minha reserva!_`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-emerald-100 selection:text-emerald-900 flex flex-col font-sans">
      <Header onAdminToggle={toggleAdmin} isAdminMode={view === 'admin'} />
      
      {showLoginModal && (
        <LoginModal 
          onLogin={handleLoginSuccess} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}

      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center overflow-x-hidden">
        {view === 'admin' && (
          <ManagementView 
            config={config} 
            onUpdateConfig={setConfig} 
            onBackToSite={() => setView('calendar')}
          />
        )}

        {view === 'calendar' && (
          <section className="w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">
                Seu Day Use <span className="text-emerald-600">Vista Alegre.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-bold uppercase tracking-widest">
                Escolha uma data liberada no calendário
              </p>
            </div>
            
            <div className="w-full flex justify-center origin-top">
              <CalendarView 
                onConfirm={handleDateSelected} 
                daysConfig={config.days} 
                globalLimit={config.globalLimitPerDay}
              />
            </div>
          </section>
        )}

        {view === 'form' && bookingDate && (
          <section className="w-full max-w-3xl mb-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Voltar ao Calendário
            </button>
            <BookingForm 
              day={bookingDate.day} 
              month={bookingDate.month}
              dateKey={bookingDate.fullDate}
              ageTiers={config.ageTiers}
              allPreviousBookings={allPreviousBookings}
              onSuccess={handleBookingSuccess}
              initialCpf={identifiedCpf}
            />
          </section>
        )}

        {view === 'success' && lastBooking && (
          <section className="w-full max-w-2xl py-8 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Reserva Solicitada!</h2>
              <p className="text-slate-500 font-medium text-sm">Confira o resumo da sua reserva abaixo.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-slate-100 overflow-hidden mb-10">
              <div className="bg-slate-900 px-10 py-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Solicitação de Reserva</p>
                  <p className="text-2xl font-black tracking-widest">#{lastBooking.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status</p>
                  <p className="text-xs font-bold text-orange-400 uppercase">Pendente de Pagamento</p>
                </div>
              </div>

              <div className="p-10 space-y-8">
                {/* Informações Principais */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Responsável</p>
                    <p className="text-sm font-bold text-slate-900 uppercase">{lastBooking.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{lastBooking.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Data Escolhida</p>
                    <p className="text-sm font-black text-emerald-600 uppercase">{bookingDate?.day} de {bookingDate?.month} de 2024</p>
                    <p className="text-[10px] text-slate-400 mt-1">Check-in: 09:00h</p>
                  </div>
                </div>

                {/* Breakdown de Convidados */}
                <div className="pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Resumo dos Visitantes</p>
                  <div className="space-y-3">
                    {config.ageTiers.map(tier => {
                      const count = lastBooking.guestBreakdown[tier.id] || 0;
                      if (count === 0) return null;
                      return (
                        <div key={tier.id} className="flex justify-between items-center py-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-black text-slate-900">{count}x</span>
                            <span className="text-sm font-bold text-slate-600">{tier.label}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">R$ {(count * tier.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Geral</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Sua reserva inclui todas as áreas de lazer</p>
                   </div>
                   <div className="text-right">
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {calculateTotalPrice(lastBooking).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleWhatsAppShare}
                className="flex-1 px-8 py-5 bg-[#25D366] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#128C7E] transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.062c-3.411 0-6.182 2.771-6.182 6.182 0 1.09.284 2.155.823 3.092l-.875 3.197 3.271-.858c.905.493 1.925.751 2.964.751h.003c3.41 0 6.181-2.771 6.181-6.182 0-3.411-2.771-6.182-6.181-6.182zm3.377 8.719c-.146.411-.851.782-1.177.829-.327.047-.733.067-2.143-.505-1.801-.733-2.964-2.569-3.054-2.693-.09-.124-.733-.974-.733-1.865 0-.89.467-1.328.634-1.503.166-.175.361-.22.482-.22s.241.002.346.006c.11.004.258-.041.405.314.146.355.501 1.22.545 1.31s.073.19.015.306c-.058.117-.088.19-.175.292-.088.102-.185.228-.263.306-.088.087-.179.182-.077.358.102.175.452.747.97 1.206.666.592 1.226.776 1.402.863.175.088.277.073.38-.044.102-.117.438-.511.555-.686.117-.175.234-.146.395-.088s1.023.482 1.2.569c.177.087.294.131.338.205.044.073.044.425-.102.836z"/></svg>
                Pagar via PIX no WhatsApp
              </button>
              <button 
                onClick={() => setView('calendar')}
                className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                Voltar ao Início
              </button>
            </div>
          </section>
        )}
      </main>

      <AIConcierge />

      <footer className="border-t border-slate-100 py-10 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">
            © 2024 VISTA ALEGRE FAZENDA HOTEL.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
