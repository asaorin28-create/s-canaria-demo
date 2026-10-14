import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Award,
  PlaySquare,
  Menu,
  X,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    mobileMenuOpen,
    toggleMobileMenu,
    players,
    convocatorias,
  } = useApp();

  const handleTabClick = (tab: NavigationTab) => {
    setCurrentTab(tab);
  };

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 md:hidden safe-area-bottom shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {/* 1. Inicio */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
            currentTab === 'dashboard' && !mobileMenuOpen
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {currentTab === 'dashboard' && !mobileMenuOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight">Inicio</span>
        </button>

        {/* 2. Jugadores */}
        <button
          onClick={() => handleTabClick('players')}
          className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
            currentTab === 'players' && !mobileMenuOpen
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-bold bg-amber-400 text-slate-950 rounded-full leading-none py-0.5 min-w-[14px] text-center shadow-xs">
              {players.length}
            </span>
            {currentTab === 'players' && !mobileMenuOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight">Jugadores</span>
        </button>

        {/* 3. Convocatorias */}
        <button
          onClick={() => handleTabClick('convocatorias')}
          className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
            currentTab === 'convocatorias' && !mobileMenuOpen
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Award className="w-5 h-5" />
            {convocatorias.length > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-bold bg-blue-500 text-white rounded-full leading-none py-0.5 min-w-[14px] text-center shadow-xs">
                {convocatorias.length}
              </span>
            )}
            {currentTab === 'convocatorias' && !mobileMenuOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight">Convocatorias</span>
        </button>

        {/* 4. Pizarra Táctica */}
        <button
          onClick={() => handleTabClick('tactics')}
          className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
            currentTab === 'tactics' && !mobileMenuOpen
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <PlaySquare className="w-5 h-5" />
            {currentTab === 'tactics' && !mobileMenuOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight">Pizarra</span>
        </button>

        {/* 5. Menú Completo (Desplegar/Quitar menú lateral) */}
        <button
          onClick={toggleMobileMenu}
          className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
            mobileMenuOpen
              ? 'text-amber-300 font-bold bg-amber-400/10 rounded-xl my-1'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={mobileMenuOpen ? 'Quitar menú lateral' : 'Desplegar menú lateral'}
          aria-label={mobileMenuOpen ? 'Quitar menú lateral' : 'Desplegar menú lateral'}
        >
          <div className="relative">
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-amber-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            {mobileMenuOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight">
            {mobileMenuOpen ? 'Cerrar' : 'Menú'}
          </span>
        </button>
      </div>
    </nav>
  );
};
