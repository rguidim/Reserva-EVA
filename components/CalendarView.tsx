
import React, { useState } from 'react';
import { DayConfig } from '../types';

interface CalendarViewProps {
  onConfirm: (day: number, month: string) => void;
  daysConfig?: Record<string, DayConfig>;
  globalLimit: number;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onConfirm, daysConfig = {}, globalLimit }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const daysInMonth = 31;
  const startDay = 1; // Segunda-feira em Julho 2024
  const monthName = "Julho 2024";

  const isDefaultBlocked = (day: number) => {
    const date = new Date(2024, 6, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay !== null) {
      const dateKey = `2024-07-${selectedDay.toString().padStart(2, '0')}`;
      const config = daysConfig[dateKey];
      const isBlocked = config ? config.isBlocked : isDefaultBlocked(selectedDay);
      const limit = config ? config.limit : globalLimit;
      const current = config ? config.currentBookings : 0;
      
      if (!isBlocked && current < limit) {
        onConfirm(selectedDay, "Julho");
      }
    }
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const currentDayKey = selectedDay ? `2024-07-${selectedDay.toString().padStart(2, '0')}` : null;
  const currentDayConfig = currentDayKey ? daysConfig[currentDayKey] : null;
  const isSelectedDayBlocked = selectedDay ? (currentDayConfig ? currentDayConfig.isBlocked : isDefaultBlocked(selectedDay)) : false;
  const isSelectedDayFull = selectedDay ? (currentDayConfig ? currentDayConfig.currentBookings >= currentDayConfig.limit : false) : false;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-slate-100 p-8 sm:p-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{monthName}</h2>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow-inner">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Disponibilidade em tempo real</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-10">
          {weekdays.map(wd => (
            <div key={wd} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pb-4">
              {wd}
            </div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDay === day;
            const dateKey = `2024-07-${day.toString().padStart(2, '0')}`;
            const config = daysConfig[dateKey];
            
            const isBlocked = config ? config.isBlocked : isDefaultBlocked(day);
            const limit = config ? config.limit : globalLimit;
            const current = config ? config.currentBookings : 0;
            const vacancies = Math.max(0, limit - current);
            const isFull = vacancies === 0;

            let vacancyColor = "text-emerald-500";
            if (vacancies < 10) vacancyColor = "text-orange-500";
            if (isFull) vacancyColor = "text-red-400";

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative aspect-square rounded-[2rem] flex flex-col items-center justify-center transition-all border-2
                  ${isBlocked 
                    ? 'bg-red-50/40 border-red-100 text-red-300 cursor-not-allowed' 
                    : isFull 
                      ? 'bg-slate-50 border-slate-100 text-slate-400' 
                      : 'bg-blue-50/40 border-blue-100 text-blue-900 hover:border-blue-300 hover:bg-blue-50/60 hover:scale-105'}
                  ${isSelected 
                    ? 'ring-4 ring-emerald-500/30 border-emerald-500 bg-emerald-600 text-white z-10 scale-110 shadow-xl' 
                    : ''}
                `}
              >
                <span className={`text-xl font-black ${isSelected ? 'text-white' : ''}`}>{day}</span>
                {!isBlocked && (
                  <span className={`text-[10px] font-black absolute bottom-4 ${isSelected ? 'text-white/80' : vacancyColor}`}>
                    {isFull ? 'Esgotado' : `${vacancies}v`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-10 border-t border-slate-100 gap-8">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-600 rounded-full shadow-md shadow-emerald-200"></div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Selecionado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-100 rounded-full"></div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Liberado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-100 rounded-full"></div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bloqueado</span>
            </div>
          </div>
          
          <button 
            onClick={handleConfirm}
            className="w-full sm:w-auto px-16 py-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={selectedDay === null || isSelectedDayBlocked || isSelectedDayFull}
          >
            {isSelectedDayBlocked ? 'Indisponível' : isSelectedDayFull ? 'Data Esgotada' : (selectedDay !== null ? `Confirmar Dia ${selectedDay}` : 'Selecione uma data')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
