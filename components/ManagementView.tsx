
import React, { useState } from 'react';
import { SiteConfig, AgeTier, DayConfig, BookingDetail } from '../types';

interface ManagementViewProps {
  config: SiteConfig;
  onUpdateConfig: (newConfig: SiteConfig) => void;
  onBackToSite: () => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({ config, onUpdateConfig, onBackToSite }) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [viewingBooking, setViewingBooking] = useState<BookingDetail | null>(null);
  const [activeDateKeyForModal, setActiveDateKeyForModal] = useState<string | null>(null);
  
  const daysInMonth = 31;
  const monthName = "Julho 2024";

  const isDefaultBlocked = (day: number) => {
    const date = new Date(2024, 6, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  const handleDayClick = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const togglePaymentStatus = (dateKey: string, bookingId: string, paid: boolean) => {
    const dayConfig = config.days[dateKey];
    if (!dayConfig || !dayConfig.bookings) return;

    const updatedBookings = dayConfig.bookings.map(b => 
      b.id === bookingId ? { ...b, paid } : b
    );

    const updatedConfig = {
      ...config,
      days: {
        ...config.days,
        [dateKey]: {
          ...dayConfig,
          bookings: updatedBookings
        }
      }
    };

    onUpdateConfig(updatedConfig);
    
    if (viewingBooking?.id === bookingId) {
      setViewingBooking({ ...viewingBooking, paid });
    }
  };

  const applyBatchStatus = (blocked: boolean) => {
    const newDays = { ...config.days };
    selectedDays.forEach(day => {
      const dateKey = `2024-07-${day.toString().padStart(2, '0')}`;
      newDays[dateKey] = {
        ...(newDays[dateKey] || { limit: config.globalLimitPerDay, currentBookings: 0, bookings: [] }),
        isBlocked: blocked
      };
    });

    onUpdateConfig({
      ...config,
      days: newDays
    });
    setSelectedDays([]);
  };

  const updateAgeTier = (id: string, updates: Partial<AgeTier>) => {
    onUpdateConfig({
      ...config,
      ageTiers: config.ageTiers.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const handleLimitChange = (newLimit: number) => {
    if (selectedDays.length === 0) {
      // Caso 1: Nenhuma data selecionada -> Altera limite global e de todas as datas existentes
      const updatedDays = { ...config.days };
      Object.keys(updatedDays).forEach(key => {
        updatedDays[key] = { ...updatedDays[key], limit: newLimit };
      });
      onUpdateConfig({
        ...config,
        globalLimitPerDay: newLimit,
        days: updatedDays
      });
    } else {
      // Caso 2: Datas selecionadas -> Altera APENAS as datas selecionadas
      const updatedDays = { ...config.days };
      selectedDays.forEach(day => {
        const dateKey = `2024-07-${day.toString().padStart(2, '0')}`;
        updatedDays[dateKey] = {
          ...(updatedDays[dateKey] || { isBlocked: isDefaultBlocked(day), currentBookings: 0, bookings: [] }),
          limit: newLimit
        };
      });
      onUpdateConfig({
        ...config,
        days: updatedDays
      });
    }
  };

  // Valor a ser exibido no input de limite
  const getDisplayLimit = () => {
    if (selectedDays.length === 0) return config.globalLimitPerDay;
    const firstDayKey = `2024-07-${selectedDays[0].toString().padStart(2, '0')}`;
    return config.days[firstDayKey]?.limit || config.globalLimitPerDay;
  };

  const handleExportXLSX = (day: number, bookings: BookingDetail[]) => {
    if (bookings.length === 0) return;

    const baseHeaders = ["ID Reserva", "Status Pagamento", "Nome", "CPF", "Telefone", "E-mail", "Data Nasc.", "Horário Registro", "Total Pessoas"];
    const ageTierHeaders = config.ageTiers.map(tier => tier.label);
    const headers = [...baseHeaders, ...ageTierHeaders];

    const rows = bookings.map(b => {
      const baseData = [
        b.id,
        b.paid ? "PAGO" : "PENDENTE",
        b.name,
        b.cpf,
        b.phone,
        b.email,
        b.birthDate,
        b.timestamp,
        b.totalGuests
      ];
      const tierCounts = config.ageTiers.map(tier => b.guestBreakdown[tier.id] || 0);
      return [...baseData, ...tierCounts];
    });

    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservas-vista-alegre-dia-${day.toString().padStart(2, '0')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 pb-20 relative">
      {/* Modal de Detalhes da Reserva */}
      {viewingBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingBooking(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-1 uppercase">{viewingBooking.name}</h3>
                  <p className={`font-bold text-xs uppercase tracking-widest ${viewingBooking.paid ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {viewingBooking.paid ? 'Pagamento Confirmado' : 'Aguardando Pagamento'} • {viewingBooking.timestamp}
                  </p>
                </div>
                <button 
                  onClick={() => setViewingBooking(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4">
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Total de Convidados</p>
                   <p className="text-xl font-black">{viewingBooking.totalGuests}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">ID Reserva</p>
                   <p className="text-xl font-black">#{viewingBooking.id}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewingBooking.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-sm font-black text-slate-900 uppercase">Confirmar Pagamento</span>
                </div>
                <button 
                  onClick={() => activeDateKeyForModal && togglePaymentStatus(activeDateKeyForModal, viewingBooking.id, !viewingBooking.paid)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${viewingBooking.paid ? 'bg-emerald-600 ring-emerald-200' : 'bg-slate-200 ring-slate-100'}`}
                >
                  <span className={`${viewingBooking.paid ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Composição do Grupo</h4>
                <div className="grid grid-cols-1 gap-3">
                   {config.ageTiers.map(tier => {
                     const count = viewingBooking.guestBreakdown?.[tier.id] || 0;
                     if (count === 0) return null;
                     return (
                       <div key={tier.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm font-black text-xs">
                                {count}
                             </div>
                             <span className="text-sm font-bold text-slate-900">{tier.label}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-800 px-2 py-1 rounded-lg">
                             R$ {(tier.price * count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                       </div>
                     );
                   })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dados do Responsável</h4>
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem label="CPF" value={viewingBooking.cpf} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>} />
                  <DetailItem label="Telefone" value={viewingBooking.phone} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
                  <DetailItem label="E-mail" value={viewingBooking.email} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>} />
                  <DetailItem label="Nascimento" value={new Date(viewingBooking.birthDate).toLocaleDateString('pt-BR')} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                </div>
              </div>
              
              <button 
                onClick={() => setViewingBooking(null)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs transition-colors"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1">
          <button 
            onClick={onBackToSite}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 hover:translate-x-[-4px] transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            Voltar para o Site de Reservas
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Gestão Vista Alegre</h1>
          <p className="text-slate-400 font-medium text-sm">Controle de disponibilidade e ocupação em tempo real</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={onBackToSite}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Ver Site de Reservas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xs tracking-tighter">01</div>
                Ocupação das Datas
              </h2>
              {selectedDays.length > 0 && (
                <div className="flex items-center gap-2 animate-in zoom-in-95">
                  <span className="text-xs font-bold text-slate-400 mr-2">{selectedDays.length} selecionado(s)</span>
                  <button 
                    onClick={() => setSelectedDays([])}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                  >
                    Limpar Seleção
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-7 gap-3 mb-10">
              {Array.from({ length: 1 }).map((_, i) => <div key={i} />)}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = `2024-07-${day.toString().padStart(2, '0')}`;
                const dayConfig = config.days[dateKey];
                
                const isBlocked = dayConfig ? dayConfig.isBlocked : isDefaultBlocked(day);
                const isSelected = selectedDays.includes(day);
                const current = dayConfig?.currentBookings || 0;
                const limit = dayConfig?.limit || config.globalLimitPerDay;
                const available = Math.max(0, limit - current);
                const occupancyPercent = (current / limit) * 100;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-28 rounded-2xl border-2 flex flex-col p-3 transition-all relative group overflow-hidden
                      ${isBlocked 
                        ? 'bg-red-50/50 border-red-100 hover:border-red-300' 
                        : 'bg-blue-50/50 border-blue-100 hover:border-blue-300'}
                      ${isSelected ? 'ring-4 ring-emerald-500/30 border-emerald-500 z-10 scale-105 shadow-lg' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start w-full mb-1">
                      <span className={`font-black text-lg ${isBlocked ? 'text-red-900' : 'text-blue-900'}`}>{day}</span>
                    </div>
                    
                    <div className="mt-auto w-full text-left">
                      {isBlocked ? (
                        <p className="text-[9px] font-black uppercase tracking-tighter text-red-400">Bloqueado</p>
                      ) : (
                        <>
                          <div className="flex justify-between items-end mb-1">
                            <p className="text-[10px] font-black text-blue-900">{available}</p>
                            <p className="text-[7px] font-bold text-blue-400 uppercase tracking-tighter">Vagas</p>
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 tracking-tighter mb-1.5">Max: {limit}</p>
                        </>
                      )}
                      
                      <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isBlocked ? 'bg-red-200' : (occupancyPercent > 80 ? 'bg-orange-400' : 'bg-blue-400')}`}
                          style={{ width: isBlocked ? '100%' : `${occupancyPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedDays.length > 0 && (
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white animate-in slide-in-from-bottom-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Alterar {selectedDays.length} data(s)</h3>
                      <p className="text-slate-500 text-xs font-medium">Configure a disponibilidade para o lote selecionado</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => applyBatchStatus(false)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                      >
                        Liberar Vagas
                      </button>
                      <button 
                        onClick={() => applyBatchStatus(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                      >
                        Bloquear Tudo
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedDays.sort((a,b) => a-b).map(day => (
                      <span key={day} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold">Dia {day}</span>
                    ))}
                  </div>
                </div>

                {selectedDays.sort((a,b) => a-b).map(day => {
                   const dateKey = `2024-07-${day.toString().padStart(2, '0')}`;
                   const dayBookings = config.days[dateKey]?.bookings || [];
                   
                   return (
                    <div key={dateKey} className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-8 animate-in zoom-in-95">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Reservas - Dia {day.toString().padStart(2, '0')}</h3>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleExportXLSX(day, dayBookings)}
                            disabled={dayBookings.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Exportar
                          </button>
                          <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{dayBookings.length} TOTAL</span>
                        </div>
                      </div>
                      
                      {dayBookings.length > 0 ? (
                        <div className="space-y-3">
                          {dayBookings.map(booking => (
                            <div 
                              key={booking.id} 
                              onClick={() => {
                                setViewingBooking(booking);
                                setActiveDateKeyForModal(dateKey);
                              }}
                              className={`p-4 rounded-2xl border flex justify-between items-center shadow-sm cursor-pointer transition-all group
                                ${booking.paid ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-emerald-400'}
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePaymentStatus(dateKey, booking.id, !booking.paid);
                                  }}
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                    ${booking.paid 
                                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                                      : 'bg-white border-slate-200 text-transparent hover:border-emerald-400'}
                                  `}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                </button>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-black text-slate-900 uppercase text-xs group-hover:text-emerald-600">{booking.name}</p>
                                    {booking.paid && (
                                      <span className="text-[8px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase">Pago</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{booking.timestamp} • {booking.totalGuests} Convidados</p>
                                </div>
                              </div>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-6 text-emerald-600/50 text-xs font-black uppercase tracking-widest italic">Nenhuma reserva para este dia.</p>
                      )}
                    </div>
                   );
                })}
              </div>
            )}
            
            {selectedDays.length === 0 && (
              <div className="flex items-center justify-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-center">
                  <svg className="w-8 h-8 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Selecione datas para gerenciar ocupação ou ver listas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xs tracking-tighter">02</div>
              Configurações
            </h2>

            {/* SEÇÃO DE CAPACIDADE - DINÂMICA */}
            <div className="mb-10 pb-10 border-b border-slate-50">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Capacidade de Operação</p>
               <div className={`p-5 rounded-2xl border transition-all duration-500 ${selectedDays.length > 0 ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}>
                 <div className="flex justify-between items-center mb-4">
                   <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
                     {selectedDays.length > 0 ? `Limite (${selectedDays.length} selecionadas)` : 'Limite Global (Todas)'}
                   </span>
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${selectedDays.length > 0 ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'}`}>
                     {selectedDays.length > 0 ? 'Lote' : 'Padrão'}
                   </span>
                 </div>
                 <div className="flex items-center gap-4">
                    <input 
                      type="number"
                      className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={getDisplayLimit()}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                    />
                 </div>
                 <p className="mt-3 text-[8px] text-slate-400 font-bold italic leading-relaxed">
                   {selectedDays.length > 0 
                    ? "* Altera apenas as datas marcadas no calendário." 
                    : "* Altera o padrão do site e força a atualização de todas as datas atuais."}
                 </p>
               </div>
            </div>

            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Tarifário Day Use</p>
            <div className="space-y-4">
              {config.ageTiers.map(tier => (
                <div key={tier.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-center">
                    <input 
                      className="bg-transparent font-black text-slate-900 border-none p-0 focus:ring-0 text-xs w-2/3"
                      value={tier.label}
                      onChange={(e) => updateAgeTier(tier.id, { label: e.target.value })}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-600 font-bold text-[10px]">R$</span>
                      <input 
                        type="number"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-slate-900 text-xs w-16 text-center"
                        value={tier.price}
                        onChange={(e) => updateAgeTier(tier.id, { price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Min</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                        value={tier.minAge}
                        onChange={(e) => updateAgeTier(tier.id, { minAge: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Max</label>
                      <input 
                        type="number"
                        placeholder="+"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold"
                        value={tier.maxAge || ''}
                        onChange={(e) => updateAgeTier(tier.id, { maxAge: e.target.value ? Number(e.target.value) : null })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default ManagementView;
