
import React, { useState, useMemo, useEffect } from 'react';
import { AgeTier, BookingDetail } from '../types';

interface BookingFormProps {
  day: number;
  month: string;
  dateKey: string;
  ageTiers: AgeTier[];
  allPreviousBookings: BookingDetail[];
  onSuccess: (bookingData: Omit<BookingDetail, 'id' | 'timestamp' | 'date'>) => void;
  initialCpf?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ day, month, dateKey, ageTiers, allPreviousBookings, onSuccess, initialCpf = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: initialCpf,
    phone: '',
    email: '',
    birthDate: '',
  });

  const [isReturningUser, setIsReturningUser] = useState(false);
  const [userHistory, setUserHistory] = useState<BookingDetail[]>([]);
  const [existingBookingsForToday, setExistingBookingsForToday] = useState<BookingDetail[]>([]);
  const [showFormAnyway, setShowFormAnyway] = useState(false);

  // Initialize guest counts from tiers
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ageTiers.forEach(tier => {
      initial[tier.id] = tier.id === ageTiers[ageTiers.length - 1].id ? 1 : 0;
    });
    return initial;
  });

  // Effect to handle initial identification or changes
  useEffect(() => {
    if (formData.cpf.length === 11) {
      const userBookings = allPreviousBookings.filter(b => b.cpf === formData.cpf);
      
      if (userBookings.length > 0) {
        const latest = userBookings[userBookings.length - 1];
        setFormData(prev => ({
          ...prev,
          name: latest.name,
          phone: latest.phone,
          email: latest.email,
          birthDate: latest.birthDate
        }));
        setIsReturningUser(true);
        setUserHistory(userBookings);

        const todayMatches = userBookings.filter(b => b.date === dateKey);
        if (todayMatches.length > 0) {
          setExistingBookingsForToday(todayMatches);
          setShowFormAnyway(false);
        } else {
          setExistingBookingsForToday([]);
          setShowFormAnyway(true);
        }
      } else {
        setIsReturningUser(false);
        setUserHistory([]);
        setExistingBookingsForToday([]);
        setShowFormAnyway(true);
      }
    } else {
      setIsReturningUser(false);
      setUserHistory([]);
      setExistingBookingsForToday([]);
      setShowFormAnyway(true);
    }
  }, [formData.cpf, allPreviousBookings, dateKey]);

  const totalGuests = useMemo(() => {
    return Object.values(guestCounts).reduce((a: number, b: number) => a + b, 0);
  }, [guestCounts]);

  const totalPrice = useMemo(() => {
    return ageTiers.reduce((acc, tier) => {
      return acc + (guestCounts[tier.id] || 0) * tier.price;
    }, 0);
  }, [ageTiers, guestCounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      ...formData,
      totalGuests,
      guestBreakdown: guestCounts
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleGuestChange = (tierId: string, delta: number) => {
    setGuestCounts(prev => ({
      ...prev,
      [tierId]: Math.max(0, (prev[tierId] || 0) + delta)
    }));
  };

  const handleNumericInput = (field: string, value: string, maxLength: number) => {
    const onlyNums = value.replace(/\D/g, '').slice(0, maxLength);
    setFormData(prev => ({ ...prev, [field]: onlyNums }));
  };

  const inputClass = "w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2";

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-slate-100 p-8 sm:p-12 transition-all duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Day Use • {day}/{month}</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-slate-400 text-sm font-medium">Preencha os dados do responsável pela reserva</p>
        </div>
      </div>

      {/* RESERVAS EXISTENTES NESTA DATA */}
      {existingBookingsForToday.length > 0 && !showFormAnyway && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 mb-8">
            <h3 className="text-xl font-black text-emerald-900 mb-4 uppercase tracking-tight text-center">
              Identificamos suas reservas para hoje!
            </h3>
            <div className="space-y-4 max-w-md mx-auto">
              {existingBookingsForToday.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 text-left border border-emerald-200 shadow-sm space-y-3">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <p className="text-sm font-black text-slate-900 uppercase">Reserva #{booking.id}</p>
                      <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${booking.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {booking.paid ? 'Confirmada' : 'Pendente'}
                      </span>
                   </div>
                   <p className="text-xs font-bold text-slate-500">{booking.totalGuests} Visitantes • {booking.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowFormAnyway(true)}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Fazer outra reserva para este dia
          </button>
        </div>
      )}

      {(showFormAnyway || existingBookingsForToday.length === 0) && (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>CPF do Responsável</label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  inputMode="numeric"
                  placeholder="Apenas números" 
                  className={`${inputClass} ${isReturningUser ? 'ring-2 ring-emerald-500/20' : ''}`}
                  value={formData.cpf}
                  onChange={(e) => handleNumericInput('cpf', e.target.value, 11)}
                />
                {isReturningUser && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                    <span className="text-[9px] font-black text-emerald-700 uppercase">Reconhecido</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Nome Completo</label>
              <input required type="text" className={inputClass} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className={labelClass}>Data de Nascimento</label>
              <input 
                required 
                type="date" 
                className={inputClass} 
                value={formData.birthDate} 
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input required type="tel" inputMode="numeric" className={inputClass} value={formData.phone} onChange={(e) => handleNumericInput('phone', e.target.value, 11)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>E-mail</label>
              <input required type="email" className={inputClass} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6 uppercase">Quem irá com você?</h3>
            <div className="space-y-4">
              {ageTiers.map(tier => (
                <GuestCounter 
                  key={tier.id}
                  label={tier.label} 
                  price={tier.price === 0 ? 'Grátis' : `R$ ${tier.price}`}
                  value={guestCounts[tier.id] || 0}
                  onChange={(d) => handleGuestChange(tier.id, d)}
                />
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400">Total Previsto</p>
              <p className="text-3xl font-black text-slate-900">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button type="submit" className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs">
              Confirmar Reserva
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const GuestCounter = ({ label, price, value, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div>
      <p className="font-bold text-slate-900 text-sm">{label}</p>
      <span className="text-[10px] font-black text-emerald-600 uppercase">{price}</span>
    </div>
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => onChange(-1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-emerald-600">-</button>
      <span className="w-4 text-center font-black text-slate-900">{value}</span>
      <button type="button" onClick={() => onChange(1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-emerald-600">+</button>
    </div>
  </div>
);

export default BookingForm;
