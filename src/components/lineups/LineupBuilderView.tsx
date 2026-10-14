import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Lineup, LineupSlot, PositionCode } from '../../types';
import { FORMATIONS_DEFAULT } from '../../data/positions';
import {
  Shirt,
  Download,
  Printer,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Users,
  Search,
  Check,
  Star,
  Award,
} from 'lucide-react';

export const LineupBuilderView: React.FC = () => {
  const { lineups, addLineup, updateLineup, players, convocatorias, canEdit } = useApp();

  const [activeLineup, setActiveLineup] = useState<Lineup>(lineups[0] || null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [playerSearch, setPlayerSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('todos');
  const [draggingSlotIndex, setDraggingSlotIndex] = useState<number | null>(null);

  const pitchRef = useRef<HTMLDivElement>(null);

  // Apply formation preset
  const handleFormationChange = (formation: Lineup['formation']) => {
    if (!activeLineup) return;
    const template = FORMATIONS_DEFAULT[formation];
    if (!template) return;

    const newStarting11: LineupSlot[] = template.map((slot, idx) => {
      const existing = activeLineup.starting11[idx];
      return {
        slotIndex: idx,
        x: slot.x,
        y: slot.y,
        position: slot.position,
        number: existing?.number || idx + 1,
        playerId: existing?.playerId,
        customName: existing?.customName,
        instructions: existing?.instructions,
        isCaptain: existing?.isCaptain,
      };
    });

    const updated: Lineup = {
      ...activeLineup,
      formation,
      starting11: newStarting11,
    };
    updateLineup(updated);
    setActiveLineup(updated);
  };

  // Drag on pitch (normalized coordinates 0-100%)
  const handlePitchMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingSlotIndex === null || !pitchRef.current || !activeLineup) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.max(5, Math.min(95, Math.round((clientX / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round((clientY / rect.height) * 100)));

    const updatedStarting11 = activeLineup.starting11.map((slot) =>
      slot.slotIndex === draggingSlotIndex ? { ...slot, x, y } : slot
    );

    setActiveLineup({
      ...activeLineup,
      formation: 'personalizada',
      starting11: updatedStarting11,
    });
  };

  const handlePitchMouseUp = () => {
    if (draggingSlotIndex !== null && activeLineup) {
      updateLineup(activeLineup);
      setDraggingSlotIndex(null);
    }
  };

  // Touch drag support for mobile and tablet
  const handlePitchTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggingSlotIndex === null || !pitchRef.current || !activeLineup || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = touch.clientX - rect.left;
    const clientY = touch.clientY - rect.top;

    const x = Math.max(5, Math.min(95, Math.round((clientX / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round((clientY / rect.height) * 100)));

    const updatedStarting11 = activeLineup.starting11.map((slot) =>
      slot.slotIndex === draggingSlotIndex ? { ...slot, x, y } : slot
    );

    setActiveLineup({
      ...activeLineup,
      formation: 'personalizada',
      starting11: updatedStarting11,
    });
  };

  const handlePitchTouchEnd = () => {
    if (draggingSlotIndex !== null && activeLineup) {
      updateLineup(activeLineup);
      setDraggingSlotIndex(null);
    }
  };

  // Assign player to selected slot
  const handleAssignPlayer = (playerId: string) => {
    if (selectedSlotIndex === null || !activeLineup) return;
    const p = players.find((pl) => pl.id === playerId);
    if (!p) return;

    const updatedStarting11 = activeLineup.starting11.map((slot) => {
      if (slot.slotIndex === selectedSlotIndex) {
        return {
          ...slot,
          playerId: p.id,
          customName: p.sportName,
          number: p.squadNumber || slot.number,
        };
      }
      // If player was in another slot, clear it
      if (slot.playerId === p.id) {
        return { ...slot, playerId: undefined, customName: undefined };
      }
      return slot;
    });

    const updated = { ...activeLineup, starting11: updatedStarting11 };
    updateLineup(updated);
    setActiveLineup(updated);
  };

  // Toggle captain
  const handleToggleCaptain = (slotIdx: number) => {
    if (!activeLineup) return;
    const updatedStarting11 = activeLineup.starting11.map((slot) => ({
      ...slot,
      isCaptain: slot.slotIndex === slotIdx ? !slot.isCaptain : false,
    }));
    const updated = { ...activeLineup, starting11: updatedStarting11 };
    updateLineup(updated);
    setActiveLineup(updated);
  };

  // Add new blank lineup
  const handleCreateNewLineup = () => {
    const formation: Lineup['formation'] = '4-3-3';
    const template = FORMATIONS_DEFAULT[formation];
    const newStarting11: LineupSlot[] = template.map((t, idx) => ({
      slotIndex: idx,
      x: t.x,
      y: t.y,
      position: t.position,
      number: idx + 1,
    }));

    const newLineupData: Omit<Lineup, 'id'> = {
      title: `Alineación Táctica ${lineups.length + 1}`,
      formation,
      teamCategory: 'Selección Canaria Sub-16 Masculina',
      matchDate: new Date().toISOString().split('T')[0],
      starting11: newStarting11,
      substitutes: [
        { number: 12, position: 'DFC' },
        { number: 13, position: 'POR' },
        { number: 14, position: 'MC' },
        { number: 15, position: 'ED' },
        { number: 16, position: 'DC' },
      ],
      tacticalNotes: 'Instrucciones de salida de balón y presión tras pérdida.',
    };

    addLineup(newLineupData);
  };

  // Filter available players in sidebar
  const filteredAvailablePlayers = players.filter((p) => {
    if (playerSearch.trim()) {
      const term = playerSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(term) && !p.surname.toLowerCase().includes(term) && !p.sportName.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (positionFilter !== 'todos') {
      const isPrimary = p.primaryPosition === positionFilter;
      const isSec = p.secondaryPositions?.some((s) => s.position === positionFilter);
      if (!isPrimary && !isSec) return false;
    }
    return true;
  });

  const selectedSlot = activeLineup?.starting11.find((s) => s.slotIndex === selectedSlotIndex);
  const selectedSlotPlayer = selectedSlot?.playerId
    ? players.find((p) => p.id === selectedSlot.playerId)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Constructor Visual de Onces Iniciales</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {activeLineup?.formation || '4-3-3'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Diseño táctico sobre campo interactivo, asignación de dorsales y roles de capitán
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Once (PDF)</span>
          </button>

          {canEdit && (
            <button
              onClick={handleCreateNewLineup}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Once</span>
            </button>
          )}
        </div>
      </div>

      {/* Lineup Switcher & Formations Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-slate-400 shrink-0 font-medium">Alineación:</span>
          {lineups.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setActiveLineup(l);
                setSelectedSlotIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeLineup?.id === l.id
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {l.title}
            </button>
          ))}
        </div>

        {/* Formation Selector */}
        {activeLineup && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-medium">Formación:</span>
            <select
              value={activeLineup.formation}
              onChange={(e) => handleFormationChange(e.target.value as Lineup['formation'])}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold focus:outline-none"
            >
              <option value="4-3-3">4-3-3 (Ofensivo)</option>
              <option value="4-4-2">4-4-2 (Equilibrado)</option>
              <option value="4-2-3-1">4-2-3-1 (Doble pivote)</option>
              <option value="3-5-2">3-5-2 (Carrileros)</option>
              <option value="3-4-3">3-4-3 (Rombo)</option>
              <option value="5-3-2">5-3-2 (Bloque bajo)</option>
              <option value="personalizada">Personalizada</option>
            </select>
          </div>
        )}
      </div>

      {activeLineup && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Soccer Pitch (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div
              ref={pitchRef}
              onMouseMove={handlePitchMouseMove}
              onMouseUp={handlePitchMouseUp}
              onTouchMove={handlePitchTouchMove}
              onTouchEnd={handlePitchTouchEnd}
              onTouchCancel={handlePitchTouchEnd}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-800/80 bg-gradient-to-b from-emerald-850 via-emerald-800 to-emerald-900 cursor-crosshair touch-none select-none"
              style={{
                backgroundColor: '#15803d',
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 10%, transparent 10%, transparent 20%)',
              }}
            >
              {/* Pitch Markings SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/50" strokeWidth="2" fill="none">
                {/* Border line */}
                <rect x="5%" y="4%" width="90%" height="92%" />
                {/* Midfield line */}
                <line x1="5%" y1="50%" x2="95%" y2="50%" />
                {/* Center circle & dot */}
                <circle cx="50%" cy="50%" r="12%" />
                <circle cx="50%" cy="50%" r="3" fill="white" />
                {/* Top penalty box (Away) */}
                <rect x="25%" y="4%" width="50%" height="18%" />
                <rect x="37%" y="4%" width="26%" height="7%" />
                <circle cx="50%" cy="14%" r="3" fill="white" />
                <path d="M 40% 22% A 10% 10% 0 0 0 60% 22%" />
                {/* Bottom penalty box (Home) */}
                <rect x="25%" y="78%" width="50%" height="18%" />
                <rect x="37%" y="89%" width="26%" height="7%" />
                <circle cx="50%" cy="86%" r="3" fill="white" />
                <path d="M 40% 78% A 10% 10% 0 0 1 60% 78%" />
                {/* Corner arcs */}
                <path d="M 5% 7% A 3% 3% 0 0 0 8% 4%" />
                <path d="M 95% 7% A 3% 3% 0 0 1 92% 4%" />
                <path d="M 5% 93% A 3% 3% 0 0 1 8% 96%" />
                <path d="M 95% 93% A 3% 3% 0 0 0 92% 96%" />
              </svg>

              {/* Player Tokens on Pitch */}
              {activeLineup.starting11.map((slot) => {
                const isSelected = selectedSlotIndex === slot.slotIndex;
                const isDragging = draggingSlotIndex === slot.slotIndex;
                const p = slot.playerId ? players.find((pl) => pl.id === slot.playerId) : null;
                const displayName = slot.customName || p?.sportName || slot.position;

                return (
                  <div
                    key={slot.slotIndex}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedSlotIndex(slot.slotIndex);
                      setDraggingSlotIndex(slot.slotIndex);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setSelectedSlotIndex(slot.slotIndex);
                      setDraggingSlotIndex(slot.slotIndex);
                    }}
                    className={`absolute z-10 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform select-none ${
                      isDragging ? 'scale-110 z-20' : 'hover:scale-105'
                    }`}
                  >
                    {/* Circle Token */}
                    <div
                      className={`relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all border-2 ${
                        slot.position === 'POR'
                          ? 'bg-amber-500 text-slate-950 border-white'
                          : 'bg-blue-600 text-white border-amber-300'
                      } ${isSelected ? 'ring-4 ring-amber-400 scale-110' : ''}`}
                    >
                      <span className="font-mono text-sm leading-none">{slot.number}</span>

                      {/* Captain Badge */}
                      {slot.isCaptain && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow">
                          C
                        </span>
                      )}
                    </div>

                    {/* Label Box */}
                    <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm border border-slate-700 text-center max-w-[90px] shadow">
                      <p className="text-[11px] font-semibold text-white truncate leading-tight">
                        {displayName}
                      </p>
                      <p className="text-[9px] text-amber-300 font-mono leading-tight">
                        {slot.position}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Substitutes Bench Bar */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Banquillo de Suplentes ({activeLineup.substitutes.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {activeLineup.substitutes.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center gap-2 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-amber-400 font-mono font-bold flex items-center justify-center text-[10px]">
                      {sub.number}
                    </span>
                    <span className="text-slate-200 font-medium">
                      {sub.customName || `Suplente ${sub.position}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({sub.position})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Slot Detail Editor & Squad Selector */}
          <div className="space-y-4">
            {/* Slot Editor */}
            {selectedSlot ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-white flex items-center gap-1.5 text-amber-400">
                    <span>Posición Seleccionada: {selectedSlot.position}</span>
                  </h3>
                  <button
                    onClick={() => handleToggleCaptain(selectedSlot.slotIndex)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                      selectedSlot.isCaptain
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {selectedSlot.isCaptain ? '★ Capitán Oficial' : 'Asignar Capitán'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Dorsal</label>
                    <input
                      type="number"
                      value={selectedSlot.number}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = {
                          ...activeLineup,
                          starting11: activeLineup.starting11.map((s) =>
                            s.slotIndex === selectedSlot.slotIndex ? { ...s, number: val } : s
                          ),
                        };
                        updateLineup(updated);
                        setActiveLineup(updated);
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nombre Mostrado</label>
                    <input
                      type="text"
                      value={selectedSlot.customName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = {
                          ...activeLineup,
                          starting11: activeLineup.starting11.map((s) =>
                            s.slotIndex === selectedSlot.slotIndex ? { ...s, customName: val } : s
                          ),
                        };
                        updateLineup(updated);
                        setActiveLineup(updated);
                      }}
                      placeholder="Nombre en camiseta"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Instrucciones Individuales</label>
                  <textarea
                    rows={2}
                    value={selectedSlot.instructions || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = {
                        ...activeLineup,
                        starting11: activeLineup.starting11.map((s) =>
                          s.slotIndex === selectedSlot.slotIndex ? { ...s, instructions: val } : s
                        ),
                      };
                      updateLineup(updated);
                      setActiveLineup(updated);
                    }}
                    placeholder="Ej. Fijar al extremo, desdoblar por fuera..."
                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                {selectedSlotPlayer && (
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                    <span className="text-amber-400 font-semibold block">Futbolista Vinculado:</span>
                    {selectedSlotPlayer.name} {selectedSlotPlayer.surname} ({selectedSlotPlayer.clubName})
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
                Selecciona una ficha en el campo para editar dorsal, capitán o instrucciones.
              </div>
            )}

            {/* Squad List to Assign */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Asignar Jugador al Once
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="Buscar jugador..."
                  className="flex-1 px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="todos">Pos: Todas</option>
                  <option value="POR">POR</option>
                  <option value="DFC">DFC</option>
                  <option value="LD">LD</option>
                  <option value="LI">LI</option>
                  <option value="MC">MC</option>
                  <option value="ED">ED</option>
                  <option value="EI">EI</option>
                  <option value="DC">DC</option>
                </select>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 text-xs">
                {filteredAvailablePlayers.map((p) => {
                  const isAssigned = activeLineup.starting11.some((s) => s.playerId === p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-white truncate block">
                          {p.sportName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.primaryPosition} · {p.clubName}
                        </span>
                      </div>
                      <button
                        disabled={selectedSlotIndex === null}
                        onClick={() => handleAssignPlayer(p.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors shrink-0 ${
                          isAssigned
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : selectedSlotIndex !== null
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isAssigned ? 'Titular' : 'Asignar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
