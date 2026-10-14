import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PlayersView } from './components/players/PlayersView';
import { PlayerDetailModal } from './components/players/PlayerDetailModal';
import { PlayerFormModal } from './components/players/PlayerFormModal';
import { ObservationModal } from './components/players/ObservationModal';
import { AgendaView } from './components/agenda/AgendaView';
import { ConvocatoriasView } from './components/convocatorias/ConvocatoriasView';
import { LineupBuilderView } from './components/lineups/LineupBuilderView';
import { TacticalBoardView } from './components/tactics/TacticalBoardView';
import { ReportsAndComparisonView } from './components/reports/ReportsAndComparisonView';
import { GoogleSheetsSyncView } from './components/sheets/GoogleSheetsSyncView';
import { AuditAndPrivacyView } from './components/audit/AuditAndPrivacyView';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    currentTab,
    selectedPlayer,
    setSelectedPlayer,
    isCreatePlayerOpen,
    setIsCreatePlayerOpen,
    editingPlayer,
    setEditingPlayer,
    observationModalPlayer,
    setObservationModalPlayer,
    toasts,
    removeToast,
  } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-slate-950/70 pb-24 md:pb-6 focus:outline-hidden">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'players' && <PlayersView />}
          {currentTab === 'agenda' && <AgendaView />}
          {currentTab === 'convocatorias' && <ConvocatoriasView />}
          {currentTab === 'lineups' && <LineupBuilderView />}
          {currentTab === 'tactics' && <TacticalBoardView />}
          {currentTab === 'reports' && <ReportsAndComparisonView />}
          {currentTab === 'sheets' && <GoogleSheetsSyncView />}
          {currentTab === 'audit' && <AuditAndPrivacyView />}
        </main>
      </div>

      {/* Fixed Mobile Bottom Bar for 1-thumb quick navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {(isCreatePlayerOpen || editingPlayer) && (
        <PlayerFormModal
          initialPlayer={editingPlayer}
          onClose={() => {
            setIsCreatePlayerOpen(false);
            setEditingPlayer(null);
          }}
        />
      )}

      {observationModalPlayer && (
        <ObservationModal
          player={observationModalPlayer}
          onClose={() => setObservationModalPlayer(null)}
        />
      )}

      {/* Global Toast Notification System */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-2xl border text-xs backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-red-500/40 text-red-300'
                : 'bg-slate-900/95 border-amber-500/40 text-amber-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
