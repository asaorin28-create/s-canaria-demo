import React, { useEffect } from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Award,
  Shirt,
  PlaySquare,
  FileSpreadsheet,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  EyeOff,
  UserCheck,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  badge?: number | string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarMode,
    setSidebarMode,
    sidebarCollapsed,
    sidebarHidden,
    setSidebarHidden,
    mobileMenuOpen,
    setMobileMenuOpen,
    players,
    events,
    convocatorias,
    tacticalPlays,
    currentUser,
    users,
    setCurrentUser,
  } = useApp();

  // Listen to Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
    },
    {
      id: 'players',
      label: 'Censo de Jugadores',
      badge: players.length,
      icon: Users,
    },
    {
      id: 'agenda',
      label: 'Agenda de Scouting',
      badge: events.filter((e) => e.status === 'pendiente').length,
      icon: Calendar,
    },
    {
      id: 'convocatorias',
      label: 'Convocatorias',
      badge: convocatorias.length,
      icon: Award,
    },
    {
      id: 'lineups',
      label: 'Constructor de Onces',
      icon: Shirt,
    },
    {
      id: 'tactics',
      label: 'Pizarra Táctica Animada',
      badge: tacticalPlays.length,
      icon: PlaySquare,
    },
    {
      id: 'reports',
      label: 'Informes & Comparativa',
      icon: FileText,
    },
    {
      id: 'sheets',
      label: 'Google Sheets',
      badge: 'Sync',
      icon: FileSpreadsheet,
    },
    {
      id: 'audit',
      label: 'Auditoría & Privacidad',
      icon: Lock,
    },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =========================================================================
          1. MOBILE BACKDROP OVERLAY
      ========================================================================= */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* =========================================================================
          2. MOBILE SLIDE-OVER DRAWER (Desplegable y quitable en móvil)
      ========================================================================= */}
      <aside
        aria-label="Menú principal móvil"
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header with Clear "Quitar Menú" CTA */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-sm shrink-0">
              <Shield className="w-4 h-4 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="text-sm font-bold text-white font-display block leading-tight">
                ScoutCanarias
              </span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                Selecciones FCF
              </span>
            </div>
          </div>

          {/* Explicit Dismiss Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 text-xs font-medium"
            title="Quitar / Cerrar menú"
            aria-label="Cerrar menú"
          >
            <span>Cerrar</span>
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Current Active User Info on Mobile */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-400/30">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} · {currentUser.island}</p>
            </div>
          </div>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find((usr) => usr.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="text-[11px] bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-300 focus:outline-hidden focus:border-amber-400"
            title="Cambiar usuario"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name.split(' ')[0]} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Navigation List */}
        <nav className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-800'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-slate-950' : 'text-slate-400'
                  }`}
                />
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="text-sm">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-slate-900 text-amber-300'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Mobile Drawer Footer with Bottom Quit Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Ocultar menú lateral</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center">
            Federación Canaria de Fútbol · Temporada 2025/2026
          </p>
        </div>
      </aside>

      {/* =========================================================================
          3. DESKTOP / TABLET SIDEBAR (Expandible, Colapsable y Quitable)
      ========================================================================= */}
      {!sidebarHidden && (
        <aside
          aria-label="Menú principal de navegación"
          className={`hidden md:flex relative z-20 flex-col border-r border-slate-800 bg-slate-900/90 transition-all duration-300 ease-in-out shrink-0 select-none ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Top subtle indicator */}
          <div className="px-3 pt-3 pb-1 flex items-center justify-between text-[11px] text-slate-400">
            {!sidebarCollapsed && (
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                Navegación
              </span>
            )}
            <button
              onClick={() => setSidebarHidden(true)}
              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors ml-auto"
              title="Quitar / Ocultar menú lateral para pantalla completa"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation list */}
          <nav className="flex-1 py-2 px-2 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm shadow-amber-400/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`ml-2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-slate-900 text-amber-300'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse & Hide Controls Footer */}
          <div className="p-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
            {!sidebarCollapsed ? (
              <>
                <button
                  onClick={() => setSidebarHidden(true)}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Quitar / Ocultar menú lateral"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Quitar Menú</span>
                </button>

                <button
                  onClick={() => setSidebarMode('collapsed')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-auto"
                  title="Contraer a iconos"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 w-full">
                <button
                  onClick={() => setSidebarMode('expanded')}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Desplegar menú completo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSidebarHidden(true)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Quitar menú"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Floating button on Desktop when sidebar is hidden ("Quitar menú") so user can easily deploy it back */}
      {sidebarHidden && (
        <div className="hidden md:block fixed left-3 bottom-6 z-40 animate-in fade-in slide-in-from-left duration-200">
          <button
            onClick={() => setSidebarHidden(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-amber-400 shadow-xl text-xs font-semibold backdrop-blur-md transition-all group"
            title="Desplegar menú lateral"
          >
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-slate-950" />
            <span>Desplegar Menú</span>
          </button>
        </div>
      )}
    </>
  );
};
