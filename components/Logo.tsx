
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 
          Nota: Substitua o src abaixo pelo caminho real da imagem do logotipo 
          que você enviou (ex: /logo-vista-alegre.png) 
      */}
      <img 
        src="https://img.freepik.com/vetores-premium/logotipo-da-fazenda-hotel-vista-alegre-com-palmeiras-e-sol_placeholder" 
        alt="Logo Vista Alegre Fazenda Hotel" 
        className="h-full w-auto object-contain"
        onError={(e) => {
          // Fallback caso a imagem não carregue, usando um estilo similar ao logo enviado
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
        }}
      />
      <div className="fallback-logo hidden w-12 h-12 rounded-full border-4 border-orange-400 flex items-center justify-center bg-white shadow-sm overflow-hidden p-1">
         <div className="text-[8px] font-black text-center leading-tight text-slate-800">VISTA<br/>ALEGRE</div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">EVA</span>
            <span className="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded tracking-widest uppercase">Reserva</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.05em] text-slate-400 uppercase">Vista Alegre Fazenda Hotel</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
