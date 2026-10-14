import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Convocatoria, AgeCategory, PositionCode } from '../../types';
import {
  Award,
  Plus,
  Users,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Calendar,
  Shield,
  Search,
  X,
  Check,
  ArrowRightLeft,
  UserCheck,
} from 'lucide-react';

export const ConvocatoriasView: React.FC = () => {
  const { convocatorias, players, addConvocatoria, updateConvocatoria, canEdit, currentUser } = useApp();

  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria>(
    convocatorias[0] || null
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareTargetId, setCompareTargetId] = useState<string>(
    convocatorias[1]?.id || ''
  );

  // New Convocatoria form state
  const [title, setTitle] = useState('');
  const [selectionCategory, setSelectionCategory] = useState('Selección Canaria Sub-16 Masculina');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('Sub-16');
  const [gender, setGender] = useState<'Masculino' | 'Femenino'>('Masculino');
  const [season, setSeason] = useState('2025/2026');
  const [tournamentOrMatch, setTournamentOrMatch] = useState('Campeonato de España CESA');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Las Palmas de Gran Canaria');
  const [headCoach, setHeadCoach] = useState(currentUser.name);
  const [notes, setNotes] = useState('');

  // Handle adding a player to active convocatoria
  const handleAddPlayer = (playerId: string) => {
    if (!selectedConvocatoria) return;
    const exists = selectedConvocatoria.players.some((p) => p.playerId === playerId);
    if (exists) return;

    const p = players.find((pl) => pl.id === playerId);
    const positionAssigned = p ? p.primaryPosition : 'MC';

    const updated: Convocatoria = {
      ...selectedConvocatoria,
      players: [
        ...selectedConvocatoria.players,
        {
          playerId,
          role: selectedConvocatoria.players.length < 11 ? 'titular' : 'suplente',
          status: 'confirmado',
          positionAssigned,
        },
      ],
    };
    updateConvocatoria(updated);
    setSelectedConvocatoria(updated);
  };

  // Remove player
  const handleRemovePlayer = (playerId: string) => {
    if (!selectedConvocatoria) return;
    const updated: Convocatoria = {
      ...selectedConvocatoria,
      players: selectedConvocatoria.players.filter((p) => p.playerId !== playerId),
    };
    updateConvocatoria(updated);
    setSelectedConvocatoria(updated);
  };

  // Toggle role (titular / suplente / reserva)
  const handleRoleChange = (playerId: string, role: 'titular' | 'suplente' | 'reserva') => {
    if (!selectedConvocatoria) return;
    const updated: Convocatoria = {
      ...selectedConvocatoria,
      players: selectedConvocatoria.players.map((p) =>
        p.playerId === playerId ? { ...p, role } : p
      ),
    };
    updateConvocatoria(updated);
    setSelectedConvocatoria(updated);
  };

  // Age eligibility validation
  const getAgeWarnings = (conv: Convocatoria) => {
    const warnings: string[] = [];
    const maxAge = conv.ageCategory === 'Sub-14' ? 14 : conv.ageCategory === 'Sub-16' ? 16 : 18;

    conv.players.forEach((item) => {
      const p = players.find((pl) => pl.id === item.playerId);
      if (p && p.calculatedAge > maxAge) {
        warnings.push(
          `${p.sportName} tiene ${p.calculatedAge} años (incompatible con ${conv.ageCategory})`
        );
      }
    });

    // Check GK presence
    const hasGk = conv.players.some((item) => {
      const p = players.find((pl) => pl.id === item.playerId);
      return p?.primaryPosition === 'POR' || item.positionAssigned === 'POR';
    });
    if (!hasGk && conv.players.length > 0) {
      warnings.push('No hay ningún portero (POR) asignado en la lista.');
    }

    return warnings;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addConvocatoria({
      title,
      selectionCategory,
      ageCategory,
      gender,
      season,
      tournamentOrMatch,
      startDate,
      location,
      headCoach,
      technicalStaff: ['Cuerpo Técnico FCF'],
      players: [],
      status: 'borrador',
      notes,
    });

    setIsCreateOpen(false);
  };

  const activeWarnings = selectedConvocatoria ? getAgeWarnings(selectedConvocatoria) : [];

  // Players currently in convocatoria
  const convocatoriaPlayerRecords = selectedConvocatoria
    ? selectedConvocatoria.players.map((entry) => ({
        entry,
        player: players.find((p) => p.id === entry.playerId),
      }))
    : [];

  // Comparison logic
  const compareTarget = convocatorias.find((c) => c.id === compareTargetId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Gestión de Convocatorias Oficiales</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {convocatorias.length} registradas
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprobación de elegibilidad por edad, control de asistencia y boletines oficiales
          </p>
        </div>

        <div className="flex items-center gap-2">
          {convocatorias.length > 1 && (
            <button
              onClick={() => setIsCompareOpen(!isCompareOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Comparar Convocatorias</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Boletín</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Convocatoria</span>
            </button>
          )}
        </div>
      </div>

      {/* Convocatoria Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {convocatorias.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setSelectedConvocatoria(conv)}
            className={`px-3.5 py-2 rounded-xl text-left border transition-all shrink-0 ${
              selectedConvocatoria?.id === conv.id
                ? 'bg-slate-800 border-amber-400/60 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="font-semibold text-white">{conv.title}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {conv.selectionCategory} · {conv.players.length} jugadores
            </div>
          </button>
        ))}
      </div>

      {selectedConvocatoria && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-columns: Squad list & Validation */}
          <div className="lg:col-span-2 space-y-4">
            {/* Eligibility Warnings Box */}
            {activeWarnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Avisos de Validación Federativa:</span>
                </div>
                {activeWarnings.map((w, idx) => (
                  <p key={idx} className="pl-5 text-slate-300">
                    · {w}
                  </p>
                ))}
              </div>
            )}

            {/* Squad Table */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Futbolistas Convocados ({selectedConvocatoria.players.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedConvocatoria.players.filter((p) => p.role === 'titular').length} Titulares ·{' '}
                    {selectedConvocatoria.players.filter((p) => p.role === 'suplente').length} Suplentes ·{' '}
                    {selectedConvocatoria.players.filter((p) => p.role === 'reserva').length} Reservas
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700">
                  {selectedConvocatoria.status.toUpperCase()}
                </span>
              </div>

              {convocatoriaPlayerRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Aún no se han añadido futbolistas a esta convocatoria. Utiliza el selector lateral para incorporar jugadores del censo.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {convocatoriaPlayerRecords.map(({ entry, player }) => {
                    if (!player) return null;
                    return (
                      <div
                        key={entry.playerId}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-amber-400 font-bold w-9 text-center bg-slate-800 py-0.5 rounded text-[11px]">
                            {player.primaryPosition}
                          </span>
                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block">
                              {player.sportName} ({player.name} {player.surname})
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {player.clubName} · {player.island} · {player.calculatedAge} años
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Role Selector */}
                          <select
                            value={entry.role}
                            onChange={(e) =>
                              handleRoleChange(
                                entry.playerId,
                                e.target.value as 'titular' | 'suplente' | 'reserva'
                              )
                            }
                            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                          >
                            <option value="titular">Titular</option>
                            <option value="suplente">Suplente</option>
                            <option value="reserva">Reserva</option>
                          </select>

                          {/* Remove */}
                          {canEdit && (
                            <button
                              onClick={() => handleRemovePlayer(entry.playerId)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                              title="Retirar de la lista"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Add players from Database & Details */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Añadir Futbolistas al Listado
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Selecciona jugadores compatibles con la categoría {selectedConvocatoria.ageCategory}
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {players.map((p) => {
                  const isAlreadyIn = selectedConvocatoria.players.some(
                    (item) => item.playerId === p.id
                  );
                  return (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-white truncate block">
                          {p.sportName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.primaryPosition} · {p.clubName} ({p.calculatedAge}a)
                        </span>
                      </div>
                      <button
                        disabled={isAlreadyIn}
                        onClick={() => handleAddPlayer(p.id)}
                        className={`px-2.5 py-1 rounded font-medium text-xs transition-colors shrink-0 ${
                          isAlreadyIn
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
                        }`}
                      >
                        {isAlreadyIn ? 'Incluido' : '+ Añadir'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Staff Details */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-2">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-amber-400">
                Detalles Oficiales
              </h3>
              <p className="text-slate-300">
                <strong>Seleccionador:</strong> {selectedConvocatoria.headCoach}
              </p>
              <p className="text-slate-300">
                <strong>Competición:</strong> {selectedConvocatoria.tournamentOrMatch}
              </p>
              <p className="text-slate-300">
                <strong>Fecha Concentración:</strong> {selectedConvocatoria.startDate}
              </p>
              <p className="text-slate-300">
                <strong>Lugar:</strong> {selectedConvocatoria.location}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareOpen && compareTarget && selectedConvocatoria && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                Comparativa entre Convocatorias
              </h3>
              <p className="text-xs text-slate-400">
                Analiza novedades, continuidades y futbolistas descartados
              </p>
            </div>
            <select
              value={compareTargetId}
              onChange={(e) => setCompareTargetId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            >
              {convocatorias
                .filter((c) => c.id !== selectedConvocatoria.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
              <h4 className="font-bold text-amber-400 mb-2">{selectedConvocatoria.title}</h4>
              <ul className="space-y-1">
                {selectedConvocatoria.players.map((item) => {
                  const p = players.find((pl) => pl.id === item.playerId);
                  const inOther = compareTarget.players.some((pl) => pl.playerId === item.playerId);
                  return (
                    <li
                      key={item.playerId}
                      className={`flex items-center justify-between p-1 rounded ${
                        !inOther ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-300'
                      }`}
                    >
                      <span>
                        {p?.sportName} ({p?.primaryPosition})
                      </span>
                      {!inOther && (
                        <span className="text-[10px] font-bold text-emerald-400">Novedad</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
              <h4 className="font-bold text-blue-400 mb-2">{compareTarget.title}</h4>
              <ul className="space-y-1">
                {compareTarget.players.map((item) => {
                  const p = players.find((pl) => pl.id === item.playerId);
                  const inCurrent = selectedConvocatoria.players.some(
                    (pl) => pl.playerId === item.playerId
                  );
                  return (
                    <li
                      key={item.playerId}
                      className={`flex items-center justify-between p-1 rounded ${
                        !inCurrent ? 'bg-amber-500/10 text-amber-300' : 'text-slate-300'
                      }`}
                    >
                      <span>
                        {p?.sportName} ({p?.primaryPosition})
                      </span>
                      {!inCurrent && (
                        <span className="text-[10px] font-bold text-amber-400">No convocado</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white font-display">
                Crear Convocatoria Oficial
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Título de la Convocatoria *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Fase Final CESA Sub-16"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Categoría</label>
                  <select
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Sub-12">Sub-12</option>
                    <option value="Sub-14">Sub-14</option>
                    <option value="Sub-16">Sub-16</option>
                    <option value="Sub-18">Sub-18</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Temporada</label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Competición / Motivo</label>
                  <input
                    type="text"
                    value={tournamentOrMatch}
                    onChange={(e) => setTournamentOrMatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Seleccionador Responsable</label>
                <input
                  type="text"
                  value={headCoach}
                  onChange={(e) => setHeadCoach(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Crear Convocatoria</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
