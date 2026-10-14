import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Sun,
  Moon,
  UserCheck,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { User } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    theme,
    toggleTheme,
    setIsCreatePlayerOpen,
    syncWithSheets,
    currentTab,
    mobileMenuOpen,
    toggleMobileMenu,
    sidebarMode,
    sidebarHidden,
    setSidebarHidden,
    toggleSidebarMode,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Panel Principal';
      case 'players':
        return 'Censo de Futbolistas';
      case 'agenda':
        return 'Agenda & Seguimientos';
      case 'convocatorias':
        return 'Gestión de Convocatorias';
      case 'lineups':
        return 'Constructor de Onces';
      case 'tactics':
        return 'Pizarra Táctica Animada';
      case 'reports':
        return 'Informes & Comparativa';
      case 'sheets':
        return 'Sincronización Google Sheets';
      case 'audit':
        return 'Auditoría & Privacidad RGPD';
      default:
        return 'Scouting Selecciones';
    }
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await syncWithSheets();
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 px-2.5 sm:px-4 lg:px-6 h-14 sm:h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      {/* Zone 1: Menu Toggle (Mobile & Desktop) + Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Button: Desplegar y quitar menú de la izquierda */}
        <button
          onClick={toggleMobileMenu}
          className={`md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-semibold ${
            mobileMenuOpen
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'bg-slate-800/90 text-amber-400 hover:text-white hover:bg-slate-700 border border-slate-700/80 active:scale-95'
          }`}
          title={mobileMenuOpen ? 'Quitar / Cerrar menú lateral' : 'Desplegar menú lateral'}
          aria-label={mobileMenuOpen ? 'Quitar menú lateral' : 'Desplegar menú lateral'}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-[11px] font-medium hidden xs:inline">
            {mobileMenuOpen ? 'Quitar' : 'Menú'}
          </span>
        </button>

        {/* Desktop Sidebar Toggle (Desplegar / Colapsar / Quitar menú lateral) */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setSidebarHidden(!sidebarHidden)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              sidebarHidden
                ? 'bg-amber-400/15 text-amber-400 border border-amber-400/40 hover:bg-amber-400/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={sidebarHidden ? 'Desplegar menú lateral' : 'Quitar / Ocultar menú lateral'}
          >
            {sidebarHidden ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            <span className="text-[11px] hidden xl:inline">
              {sidebarHidden ? 'Desplegar Menú' : 'Quitar Menú'}
            </span>
          </button>
        </div>

        {/* Brand Shield & Title */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-xs shrink-0">
          <Shield className="w-4 h-4 text-slate-950 fill-slate-950" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-display truncate">
              ScoutCanarias
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold uppercase tracking-wider hidden sm:inline">
              FCF
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
            {getTabLabel(currentTab)}
          </span>
        </div>
      </div>

      {/* Zone 2: Sub-information (hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
        <span className="text-slate-300 font-medium">Temporada 2025/2026</span>
        <span aria-hidden="true">·</span>
        <span>7 Islas Canarias</span>
        <span aria-hidden="true">·</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          En línea
        </span>
      </div>

      {/* Zone 3: Actions + User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Sheets Sync Button */}
        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          title="Sincronizar datos con Google Sheets"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700/60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden md:inline">Sheets</span>
        </button>

        {/* Quick Add Player CTA */}
        <button
          onClick={() => setIsCreatePlayerOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap"
          title="Añadir nuevo jugador al censo"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-xs font-bold">+ Jugador</span>
        </button>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors text-left"
            title={`Usuario: ${currentUser.name} (${currentUser.role})`}
          >
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-400/30">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden xl:flex flex-col text-xs leading-tight">
              <span className="text-slate-200 font-medium truncate max-w-[100px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-slate-400 text-[9px] uppercase">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden xs:block" />
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-700/80">
                <p className="text-xs font-semibold text-white">Simular Rol Federativo</p>
                <p className="text-[10px] text-slate-400">Prueba los permisos de cada usuario</p>
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {users.map((u: User) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition-colors ${
                      u.id === currentUser.id ? 'bg-amber-400/10 text-amber-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role} · {u.island}</p>
                    </div>
                    {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Alternar tema claro y oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
