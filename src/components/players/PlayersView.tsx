import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Player, PositionCode, Island, Foot, ScoutingStatus, AgeCategory } from '../../types';
import { POSITIONS_LIST } from '../../data/positions';
import { calculateOverallRating, getStatusInfo, exportPlayersToCSV } from '../../utils/exportUtils';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  LayoutGrid,
  List,
  Star,
  Eye,
  MapPin,
  ChevronRight,
  Shield,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const PlayersView: React.FC = () => {
  const {
    players,
    clubs,
    setSelectedPlayer,
    setObservationModalPlayer,
    setIsCreatePlayerOpen,
    toggleFavoritePlayer,
    canEdit,
  } = useApp();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgeCategory | 'todas'>('todas');
  const [selectedIsland, setSelectedIsland] = useState<Island | 'todas'>('todas');
  const [selectedClub, setSelectedClub] = useState<string>('todos');
  const [selectedPosition, setSelectedPosition] = useState<PositionCode | 'todas'>('todas');
  const [selectedFoot, setSelectedFoot] = useState<Foot | 'todos'>('todos');
  const [selectedStatus, setSelectedStatus] = useState<ScoutingStatus | 'todos'>('todos');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table';
  });
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'age' | 'status'>('rating');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'todas') count++;
    if (selectedIsland !== 'todas') count++;
    if (selectedClub !== 'todos') count++;
    if (selectedPosition !== 'todas') count++;
    if (selectedFoot !== 'todos') count++;
    if (selectedStatus !== 'todos') count++;
    if (minRating > 0) count++;
    if (onlyFavorites) count++;
    if (searchTerm.trim().length > 0) count++;
    return count;
  }, [
    selectedCategory,
    selectedIsland,
    selectedClub,
    selectedPosition,
    selectedFoot,
    selectedStatus,
    minRating,
    onlyFavorites,
    searchTerm,
  ]);

  // Saved Search Presets (Section 5.3)
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'porteros_sub14':
        setSelectedCategory('Sub-14');
        setSelectedPosition('POR');
        setSelectedIsland('todas');
        setSelectedFoot('todos');
        setSelectedStatus('todos');
        setMinRating(0);
        break;
      case 'centrales_zurdos':
        setSelectedCategory('todas');
        setSelectedPosition('DFC');
        setSelectedFoot('Izquierdo');
        setSelectedIsland('todas');
        setSelectedStatus('todos');
        setMinRating(0);
        break;
      case 'extremos_prioritarios':
        setSelectedCategory('todas');
        setSelectedPosition('EI');
        setSelectedFoot('todos');
        setSelectedIsland('todas');
        setSelectedStatus('prioritario');
        setMinRating(0);
        break;
      case 'pendientes_observacion':
        setSelectedCategory('todas');
        setSelectedPosition('todas');
        setSelectedIsland('todas');
        setSelectedFoot('todos');
        setSelectedStatus('pendiente_observar');
        setMinRating(0);
        break;
      case 'reset':
      default:
        setSearchTerm('');
        setSelectedCategory('todas');
        setSelectedIsland('todas');
        setSelectedClub('todos');
        setSelectedPosition('todas');
        setSelectedFoot('todos');
        setSelectedStatus('todos');
        setMinRating(0);
        setOnlyFavorites(false);
        break;
    }
  };

  // Filtered & Sorted Players
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        // Search term matching
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchCode = p.internalCode.toLowerCase().includes(term);
          const matchName = `${p.name} ${p.surname}`.toLowerCase().includes(term);
          const matchSport = p.sportName.toLowerCase().includes(term);
          const matchClub = p.clubName.toLowerCase().includes(term);
          if (!matchCode && !matchName && !matchSport && !matchClub) return false;
        }

        // Category filter
        if (selectedCategory !== 'todas' && p.category !== selectedCategory) return false;

        // Island filter
        if (selectedIsland !== 'todas' && p.island !== selectedIsland) return false;

        // Club filter
        if (selectedClub !== 'todos' && p.clubId !== selectedClub) return false;

        // Position filter: CRITICAL - matches BOTH primary AND secondary positions!
        if (selectedPosition !== 'todas') {
          const isPrimary = p.primaryPosition === selectedPosition;
          const isSecondary = p.secondaryPositions?.some((s) => s.position === selectedPosition);
          if (!isPrimary && !isSecondary) return false;
        }

        // Dominant Foot filter
        if (selectedFoot !== 'todos' && p.dominantFoot !== selectedFoot) return false;

        // Status filter
        if (selectedStatus !== 'todos' && p.status !== selectedStatus) return false;

        // Rating filter
        if (minRating > 0) {
          const rating = calculateOverallRating(p.ratings);
          if (rating < minRating) return false;
        }

        // Favorites filter
        if (onlyFavorites && !p.isFavorite) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return calculateOverallRating(b.ratings) - calculateOverallRating(a.ratings);
        }
        if (sortBy === 'name') {
          return a.surname.localeCompare(b.surname);
        }
        if (sortBy === 'age') {
          return b.calculatedAge - a.calculatedAge;
        }
        if (sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [
    players,
    searchTerm,
    selectedCategory,
    selectedIsland,
    selectedClub,
    selectedPosition,
    selectedFoot,
    selectedStatus,
    minRating,
    onlyFavorites,
    sortBy,
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Censo de Futbolistas Selecciones Canarias</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {filteredPlayers.length} de {players.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Base de datos federativa con polivalencia táctica y seguimiento presencial
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export to CSV */}
          <button
            onClick={() => exportPlayersToCSV(filteredPlayers)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
            title="Exportar registros filtrados a CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>

          {/* New Player */}
          {canEdit && (
            <button
              onClick={() => setIsCreatePlayerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Añadir Jugador</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-slate-700 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Vista en Tabla detallada"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-slate-700 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Vista en Tarjetas de Scouting"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Saved Search Presets Ribbon (Section 5.3) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Vistas Guardadas:
        </span>
        <button
          onClick={() => applyPreset('reset')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap border border-slate-700/60"
        >
          Todos los Jugadores
        </button>
        <button
          onClick={() => applyPreset('porteros_sub14')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap border border-slate-700/60"
        >
          Porteros Sub-14
        </button>
        <button
          onClick={() => applyPreset('centrales_zurdos')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap border border-slate-700/60"
        >
          Centrales Zurdos
        </button>
        <button
          onClick={() => applyPreset('extremos_prioritarios')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap border border-slate-700/60"
        >
          Extremos de Seguimiento Prioritario
        </button>
        <button
          onClick={() => applyPreset('pendientes_observacion')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap border border-slate-700/60"
        >
          Pendientes de Observar
        </button>
      </div>

      {/* Advanced Filters Toolbar */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, apellidos, nombre deportivo, club o código CAN..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtros de búsqueda</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <span className="text-[11px] text-amber-400 font-semibold">
              {mobileFiltersOpen ? 'Ocultar ▲' : 'Desplegar ▼'}
            </span>
          </button>
        </div>

        {/* Collapsible filters for mobile, grid for desktop */}
        <div className={`${mobileFiltersOpen ? 'block' : 'hidden md:block'} space-y-3 animate-in fade-in duration-150`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AgeCategory | 'todas')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-amber-400 text-xs"
            >
              <option value="todas">Categorías: Todas</option>
              <option value="Sub-12">Sub-12</option>
              <option value="Sub-14">Sub-14</option>
              <option value="Sub-16">Sub-16</option>
              <option value="Sub-18">Sub-18</option>
            </select>

            {/* Island */}
            <select
              value={selectedIsland}
              onChange={(e) => setSelectedIsland(e.target.value as Island | 'todas')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="todas">Islas: Todas</option>
              <option value="Gran Canaria">Gran Canaria</option>
              <option value="Tenerife">Tenerife</option>
              <option value="Lanzarote">Lanzarote</option>
              <option value="Fuerteventura">Fuerteventura</option>
              <option value="La Palma">La Palma</option>
              <option value="La Gomera">La Gomera</option>
              <option value="El Hierro">El Hierro</option>
            </select>

            {/* Position (searches primary & secondary) */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value as PositionCode | 'todas')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="todas">Posición: Cualquiera</option>
              {POSITIONS_LIST.map((pos) => (
                <option key={pos.code} value={pos.code}>
                  {pos.code} - {pos.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ScoutingStatus | 'todos')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="todos">Estado: Todos</option>
              <option value="prioritario">Prioritario</option>
              <option value="convocado">Convocado</option>
              <option value="propuesto_convocatoria">Propuesto</option>
              <option value="en_seguimiento">En Seguimiento</option>
              <option value="observado_1">Observado (1ª)</option>
              <option value="pendiente_observar">Pendiente</option>
              <option value="nuevo">Nuevo</option>
            </select>
          </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Club */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Club:</span>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
              >
                <option value="todos">Todos los clubes canarios</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Foot */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Pie:</span>
              <select
                value={selectedFoot}
                onChange={(e) => setSelectedFoot(e.target.value as Foot | 'todos')}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
              >
                <option value="todos">Cualquiera</option>
                <option value="Derecho">Diestro</option>
                <option value="Izquierdo">Zurdo</option>
                <option value="Ambidiestro">Ambidiestro</option>
              </select>
            </div>

            {/* Min Rating */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Nota Mín:</span>
              <input
                type="range"
                min="0"
                max="9.5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-20 accent-amber-400"
              />
              <span className="font-mono text-amber-400 font-bold">{minRating > 0 ? minRating : 'Todas'}</span>
            </div>

            {/* Favorites toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-400 bg-slate-800 border-slate-700"
              />
              <span>Sólo Favoritos</span>
            </label>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
            >
              <option value="rating">Mayor Valoración</option>
              <option value="name">Apellidos (A-Z)</option>
              <option value="age">Edad</option>
              <option value="status">Estado</option>
            </select>
          </div>
        </div>
        </div>
      </div>

      {/* Results Content */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No se han encontrado futbolistas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Ningún jugador coincide con los filtros aplicados. Prueba a reiniciar los criterios o ampliar la búsqueda.
          </p>
          <button
            onClick={() => applyPreset('reset')}
            className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar todos los filtros</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* DENSE TABLE VIEW (Wyscout Inspired, Image 5) */
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10 text-center">Fav</th>
                  <th className="py-3 px-4">Futbolista</th>
                  <th className="py-3 px-4">Club / Isla</th>
                  <th className="py-3 px-4">Posición</th>
                  <th className="py-3 px-4 text-center">Edad</th>
                  <th className="py-3 px-4 text-center">Pie</th>
                  <th className="py-3 px-4 text-center">Valoración</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPlayers.map((player) => {
                  const rating = calculateOverallRating(player.ratings);
                  const statusInfo = getStatusInfo(player.status);
                  const secondaryPosList = player.secondaryPositions?.map((s) => s.position).join(', ');

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      {/* Favorite Button */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoritePlayer(player.id);
                        }}
                      >
                        <button className="text-slate-500 hover:text-amber-400 transition-colors">
                          <Star
                            className={`w-4 h-4 ${
                              player.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-slate-700">
                            {player.photoUrl ? (
                              <img
                                src={player.photoUrl}
                                alt={player.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              player.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {player.surname}, {player.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {player.internalCode} · #{player.squadNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Club / Island */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{player.clubName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {player.island}
                        </div>
                      </td>

                      {/* Positions (Primary + Secondary badges) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 font-bold font-mono text-[11px] border border-amber-400/30">
                            {player.primaryPosition}
                          </span>
                          {secondaryPosList && (
                            <span className="text-[10px] text-slate-400 font-mono" title="Posiciones secundarias compatibles">
                              ({secondaryPosList})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Age */}
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-300 tabular-nums">
                        {player.calculatedAge}
                        <span className="text-[10px] text-slate-500 block">{player.category}</span>
                      </td>

                      {/* Foot */}
                      <td className="py-3 px-4 text-center text-slate-300 font-medium">
                        {player.dominantFoot}
                      </td>

                      {/* Overall Rating */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-xs border border-amber-400/20 tabular-nums">
                          {rating}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setObservationModalPlayer(player)}
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="Registrar observación"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedPlayer(player)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Abrir ficha completa"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const rating = calculateOverallRating(player.ratings);
            const statusInfo = getStatusInfo(player.status);

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 text-amber-300 font-bold flex items-center justify-center text-sm overflow-hidden shrink-0 border border-slate-700">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          player.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {player.sportName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {player.name} {player.surname}
                        </p>
                        <p className="text-[11px] text-amber-400 font-semibold truncate mt-0.5">
                          {player.clubName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-lg font-extrabold text-amber-400 tabular-nums">
                        {rating}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/10</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-slate-800/50 text-[11px] mb-3">
                    <div>
                      <span className="text-slate-500 block">Posición</span>
                      <span className="font-mono font-bold text-slate-200">
                        {player.primaryPosition}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Edad</span>
                      <span className="font-mono font-bold text-slate-200">
                        {player.calculatedAge}a ({player.category})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Isla</span>
                      <span className="font-medium text-slate-200 truncate block">
                        {player.island}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
                    "{player.tacticalProfile || 'Futbolista con perfil polivalente.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                  >
                    {statusInfo.label}
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setObservationModalPlayer(player)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Observar</span>
                    </button>
                    <button
                      onClick={() => toggleFavoritePlayer(player.id)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          player.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
