import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateOverallRating, getStatusInfo } from '../../utils/exportUtils';
import {
  Users,
  Eye,
  Award,
  Calendar,
  Compass,
  ArrowRight,
  UserPlus,
  PlaySquare,
  FileText,
  Star,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Island, ScoutingStatus } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    players,
    observations,
    events,
    convocatorias,
    setCurrentTab,
    setSelectedPlayer,
    setIsCreatePlayerOpen,
  } = useApp();

  // Metrics calculated directly from real player records
  const totalPlayers = players.length;
  const pendingPlayers = players.filter(
    (p) => p.status === 'nuevo' || p.status === 'pendiente_observar'
  ).length;
  const priorityPlayers = players.filter((p) => p.status === 'prioritario').length;
  const calledUpPlayers = players.filter((p) => p.status === 'convocado').length;
  const observationsThisMonth = observations.length;

  // Breakdown by Category
  const categoryCounts: Record<string, number> = {
    'Sub-14': players.filter((p) => p.category === 'Sub-14').length,
    'Sub-16': players.filter((p) => p.category === 'Sub-16').length,
    'Sub-18': players.filter((p) => p.category === 'Sub-18').length,
  };

  // Breakdown by Island
  const islandCounts: Record<Island, number> = {
    'Gran Canaria': players.filter((p) => p.island === 'Gran Canaria').length,
    'Tenerife': players.filter((p) => p.island === 'Tenerife').length,
    'Lanzarote': players.filter((p) => p.island === 'Lanzarote').length,
    'Fuerteventura': players.filter((p) => p.island === 'Fuerteventura').length,
    'La Palma': players.filter((p) => p.island === 'La Palma').length,
    'La Gomera': players.filter((p) => p.island === 'La Gomera').length,
    'El Hierro': players.filter((p) => p.island === 'El Hierro').length,
  };

  // Breakdown by Position Group
  const positionGroups = {
    Porteros: players.filter((p) => p.primaryPosition === 'POR').length,
    Defensas: players.filter((p) =>
      ['DFC', 'LD', 'LI', 'CRD', 'CRI'].includes(p.primaryPosition)
    ).length,
    Centrocampistas: players.filter((p) =>
      ['MCD', 'MC', 'MD', 'MI', 'MCO'].includes(p.primaryPosition)
    ).length,
    Delanteros: players.filter((p) =>
      ['ED', 'EI', 'DC', 'SD'].includes(p.primaryPosition)
    ).length,
  };

  // Status breakdown
  const statuses: ScoutingStatus[] = [
    'prioritario',
    'convocado',
    'propuesto_convocatoria',
    'en_seguimiento',
    'observado_1',
    'pendiente_observar',
    'nuevo',
  ];

  // Top rated players
  const topRated = [...players]
    .sort((a, b) => calculateOverallRating(b.ratings) - calculateOverallRating(a.ratings))
    .slice(0, 5);

  // Upcoming events
  const upcomingEvents = [...events]
    .filter((e) => e.status === 'pendiente')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner with real stadium visual */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="/src/assets/images/scouting_stadium_canarias_1791963220556.jpg"
            alt="Estadio de fútbol en Canarias"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>FEDERACIÓN CANARIA DE FÚTBOL · DIRECCIÓN TÉCNICA</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-display">
              Plataforma Integral de Scouting & Selecciones Canarias
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoreo activo de jóvenes promesas en las 7 islas del archipiélago.
              Gestión de seguimientos técnicos, convocatorias oficiales, onces tácticos y pizarra de jugadas ensayadas.
            </p>
          </div>

          {/* Quick Access Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
            <button
              onClick={() => setIsCreatePlayerOpen(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Jugador</span>
            </button>
            <button
              onClick={() => setCurrentTab('agenda')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Agenda Scout</span>
            </button>
            <button
              onClick={() => setCurrentTab('convocatorias')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Convocatorias</span>
            </button>
            <button
              onClick={() => setCurrentTab('lineups')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Once Inicial</span>
            </button>
            <button
              onClick={() => setCurrentTab('tactics')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <PlaySquare className="w-4 h-4 text-indigo-400" />
              <span>Pizarra Táctica</span>
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Informes / Wyscout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setCurrentTab('players')}
          className="cursor-pointer p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total en Censo</span>
            <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalPlayers}
            </span>
            <span className="text-xs text-slate-500">futbolistas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {categoryCounts['Sub-16']} Sub-16 · {categoryCounts['Sub-14']} Sub-14
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('players')}
          className="cursor-pointer p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Seguimiento Prioritario</span>
            <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {priorityPlayers}
            </span>
            <span className="text-xs text-slate-500">destacados</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            Proyección directa selecciones
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('convocatorias')}
          className="cursor-pointer p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Convocados Activos</span>
            <Award className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {calledUpPlayers}
            </span>
            <span className="text-xs text-slate-500">en listas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {convocatorias.length} torneos preparados
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('players')}
          className="cursor-pointer p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pendientes de Observar</span>
            <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {pendingPlayers}
            </span>
            <span className="text-xs text-slate-500">pendientes</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {observationsThisMonth} informes completados
          </p>
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Position balance & Regional distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Position Breakdown & Island Radar */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Distribución por Líneas y Posiciones
                </h3>
                <p className="text-xs text-slate-400">
                  Balance de efectivos disponibles para Selecciones Canarias
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('players')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(positionGroups).map(([pos, count]) => {
                const percentage = totalPlayers ? Math.round((count / totalPlayers) * 100) : 0;
                return (
                  <div
                    key={pos}
                    className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50"
                  >
                    <span className="text-xs text-slate-400">{pos}</span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-white tabular-nums">
                        {count}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {percentage}%
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Island Distribution Bar Chart */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Censo por Islas del Archipiélago
              </h4>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {Object.entries(islandCounts).map(([island, count]) => (
                  <div
                    key={island}
                    className="p-2.5 rounded-lg bg-slate-800/40 text-center border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="text-[11px] text-slate-400 font-medium truncate">
                      {island}
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <h3 className="text-sm font-semibold text-white mb-3">
              Embudo de Scouting & Estados de Seguimiento
            </h3>
            <div className="space-y-2.5">
              {statuses.map((st) => {
                const count = players.filter((p) => p.status === st).length;
                const info = getStatusInfo(st);
                const pct = totalPlayers ? Math.round((count / totalPlayers) * 100) : 0;
                return (
                  <div key={st} className="flex items-center gap-3 text-xs">
                    <span className={`w-32 truncate font-medium ${info.text}`}>
                      {info.label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono font-medium text-slate-300 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Top Valued Prospects & Upcoming Calendar */}
        <div className="space-y-6">
          {/* Top Rated Prospects */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400" />
                Mayor Valoración Técnica
              </h3>
              <button
                onClick={() => setCurrentTab('reports')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Comparar
              </button>
            </div>

            <div className="space-y-3">
              {topRated.map((p) => {
                const rating = calculateOverallRating(p.ratings);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlayer(p);
                      setCurrentTab('players');
                    }}
                    className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-amber-300 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-slate-600">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          p.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                          {p.sportName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {p.primaryPosition} · {p.clubName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-mono font-bold text-xs border border-amber-400/20 tabular-nums">
                        {rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Calendar Events */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Próximos Eventos
              </h3>
              <button
                onClick={() => setCurrentTab('agenda')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Ver Agenda
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[11px] text-amber-300">
                      {evt.date} · {evt.time}
                    </span>
                    <span className="capitalize text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                      {evt.type}
                    </span>
                  </div>
                  <p className="font-medium text-slate-200 line-clamp-1">
                    {evt.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {evt.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
