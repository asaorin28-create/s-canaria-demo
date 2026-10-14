import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TacticalPlay,
  TacticalPhase,
  TacticalToken,
  TacticalDrawing,
} from '../../types';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  MousePointer,
  ArrowRight,
  Move,
  Circle,
  Square as BoxIcon,
  Type,
  RotateCcw,
  Palette,
  Eye,
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';

type ToolType =
  | 'select'
  | 'arrow'
  | 'dashed_arrow'
  | 'curve'
  | 'pass_arrow'
  | 'dribble_line'
  | 'defensive_line'
  | 'zone_box'
  | 'circle_area'
  | 'text';

export const TacticalBoardView: React.FC = () => {
  const { tacticalPlays, addTacticalPlay, updateTacticalPlay, deleteTacticalPlay, canEdit } = useApp();

  const [activePlay, setActivePlay] = useState<TacticalPlay>(tacticalPlays[0] || null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState('#06B6D4'); // Canary cyan/gold
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animation Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); // 0 to 1 between current and next phase
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);

  // Board dragging & drawing interaction refs
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDraggingToken, setIsDraggingToken] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentPhase: TacticalPhase | undefined = activePlay?.phases[currentPhaseIndex];
  const nextPhase: TacticalPhase | undefined =
    activePlay?.phases[currentPhaseIndex + 1] || activePlay?.phases[0];

  // Helper to compute animated interpolated token positions
  const getInterpolatedToken = (token: TacticalToken): TacticalToken => {
    if (!isPlaying || !nextPhase || currentPhaseIndex >= activePlay.phases.length - 1) {
      return token;
    }
    const nextToken = nextPhase.tokens.find((t) => t.id === token.id);
    if (!nextToken) return token;

    // Linear interpolation
    const curX = token.x;
    const curY = token.y;
    const targetX = nextToken.x;
    const targetY = nextToken.y;

    const interpX = curX + (targetX - curX) * playProgress;
    const interpY = curY + (targetY - curY) * playProgress;

    return { ...token, x: interpX, y: interpY };
  };

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || !activePlay || activePlay.phases.length <= 1) return;

    let lastTime = performance.now();
    const duration = (currentPhase?.durationSeconds || 3) * 1000;

    const loop = (now: number) => {
      const delta = (now - lastTime) * playbackSpeed;
      lastTime = now;

      setPlayProgress((prev) => {
        const nextProg = prev + delta / duration;
        if (nextProg >= 1) {
          // Advance to next phase
          if (currentPhaseIndex < activePlay.phases.length - 1) {
            setCurrentPhaseIndex((idx) => idx + 1);
            return 0;
          } else {
            // Loop back or stop
            setCurrentPhaseIndex(0);
            return 0;
          }
        }
        return nextProg;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentPhaseIndex, activePlay, playbackSpeed, currentPhase]);

  // Handle Board Dragging of Tokens
  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boardRef.current || !activePlay || !currentPhase) return;
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.max(3, Math.min(97, Math.round((clientX / rect.width) * 100)));
    const y = Math.max(3, Math.min(97, Math.round((clientY / rect.height) * 100)));

    if (isDraggingToken && selectedTokenId) {
      const updatedTokens = currentPhase.tokens.map((t) =>
        t.id === selectedTokenId ? { ...t, x, y } : t
      );
      const updatedPhases = activePlay.phases.map((ph, idx) =>
        idx === currentPhaseIndex ? { ...ph, tokens: updatedTokens } : ph
      );
      setActivePlay({ ...activePlay, phases: updatedPhases });
    } else if (isDrawing) {
      setDrawingPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleBoardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'select' || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.max(3, Math.min(97, Math.round((clientX / rect.width) * 100)));
    const y = Math.max(3, Math.min(97, Math.round((clientY / rect.height) * 100)));

    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  // Touch support for mobile and tablet
  const handleBoardTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (selectedTool === 'select' || !boardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = touch.clientX - rect.left;
    const clientY = touch.clientY - rect.top;

    const x = Math.max(3, Math.min(97, Math.round((clientX / rect.width) * 100)));
    const y = Math.max(3, Math.min(97, Math.round((clientY / rect.height) * 100)));

    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  const handleBoardTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!boardRef.current || !activePlay || !currentPhase || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = touch.clientX - rect.left;
    const clientY = touch.clientY - rect.top;

    const x = Math.max(3, Math.min(97, Math.round((clientX / rect.width) * 100)));
    const y = Math.max(3, Math.min(97, Math.round((clientY / rect.height) * 100)));

    if (isDraggingToken && selectedTokenId) {
      const updatedTokens = currentPhase.tokens.map((t) =>
        t.id === selectedTokenId ? { ...t, x, y } : t
      );
      const updatedPhases = activePlay.phases.map((ph, idx) =>
        idx === currentPhaseIndex ? { ...ph, tokens: updatedTokens } : ph
      );
      setActivePlay({ ...activePlay, phases: updatedPhases });
    } else if (isDrawing) {
      setDrawingPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleBoardTouchEnd = () => {
    handleBoardMouseUp();
  };

  const handleBoardMouseUp = () => {
    if (isDraggingToken) {
      setIsDraggingToken(false);
      if (activePlay) updateTacticalPlay(activePlay);
    }

    if (isDrawing && drawingPoints.length > 1 && currentPhase && activePlay) {
      const newDrawing: TacticalDrawing = {
        id: `dr-${Date.now()}`,
        type: selectedTool as TacticalDrawing['type'],
        points: drawingPoints,
        color: activeColor,
        strokeWidth,
      };

      const updatedPhases = activePlay.phases.map((ph, idx) =>
        idx === currentPhaseIndex
          ? { ...ph, drawings: [...ph.drawings, newDrawing] }
          : ph
      );

      const updatedPlay = { ...activePlay, phases: updatedPhases };
      setActivePlay(updatedPlay);
      updateTacticalPlay(updatedPlay);

      setIsDrawing(false);
      setDrawingPoints([]);
      setSelectedTool('select');
    } else {
      setIsDrawing(false);
      setDrawingPoints([]);
    }
  };

  // Add a new player token
  const handleAddToken = (team: 'home' | 'away' | 'ball') => {
    if (!activePlay || !currentPhase) return;
    const id = `token-${Date.now()}`;
    const count = currentPhase.tokens.filter((t) => t.team === team).length;

    const newToken: TacticalToken = {
      id,
      team,
      number: team === 'ball' ? undefined : count + 1,
      label: team === 'ball' ? 'Balón' : team === 'home' ? `JUG ${count + 1}` : `RIV ${count + 1}`,
      x: team === 'ball' ? 50 : team === 'home' ? 45 : 55,
      y: 50,
    };

    const updatedPhases = activePlay.phases.map((ph, idx) =>
      idx === currentPhaseIndex ? { ...ph, tokens: [...ph.tokens, newToken] } : ph
    );
    const updated = { ...activePlay, phases: updatedPhases };
    setActivePlay(updated);
    updateTacticalPlay(updated);
  };

  // Delete selected token or drawing
  const handleDeleteSelected = () => {
    if (!activePlay || !currentPhase) return;
    if (selectedTokenId) {
      const updatedPhases = activePlay.phases.map((ph, idx) =>
        idx === currentPhaseIndex
          ? { ...ph, tokens: ph.tokens.filter((t) => t.id !== selectedTokenId) }
          : ph
      );
      const updated = { ...activePlay, phases: updatedPhases };
      setActivePlay(updated);
      updateTacticalPlay(updated);
      setSelectedTokenId(null);
    } else if (selectedDrawingId) {
      const updatedPhases = activePlay.phases.map((ph, idx) =>
        idx === currentPhaseIndex
          ? { ...ph, drawings: ph.drawings.filter((d) => d.id !== selectedDrawingId) }
          : ph
      );
      const updated = { ...activePlay, phases: updatedPhases };
      setActivePlay(updated);
      updateTacticalPlay(updated);
      setSelectedDrawingId(null);
    }
  };

  // Duplicate current phase
  const handleDuplicatePhase = () => {
    if (!activePlay || !currentPhase) return;
    const newPhase: TacticalPhase = {
      ...currentPhase,
      id: `ph-${Date.now()}`,
      name: `Fase ${activePlay.phases.length + 1}: Continuación`,
      tokens: currentPhase.tokens.map((t) => ({ ...t })),
      drawings: [], // clean drawings for next movement phase
    };

    const updated = {
      ...activePlay,
      phases: [...activePlay.phases, newPhase],
    };
    setActivePlay(updated);
    updateTacticalPlay(updated);
    setCurrentPhaseIndex(activePlay.phases.length);
  };

  const selectedToken = currentPhase?.tokens.find((t) => t.id === selectedTokenId);

  return (
    <div
      className={`space-y-4 max-w-7xl mx-auto pb-12 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 max-w-none h-full overflow-hidden' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Pizarra Táctica Interactiva & Jugadas Ensayadas</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {activePlay?.category.replace('_', ' ').toUpperCase()}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Animación por fases de faltas laterales, córners y salida de balón para el cuerpo técnico
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Presentation Mode (Section 8.6) */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Modo presentación a pantalla completa para charlas técnicas"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Salir Pantalla Completa' : 'Presentación'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar Gráfico</span>
          </button>
        </div>
      </div>

      {/* Play Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium">Jugada:</span>
        {tacticalPlays.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePlay(p);
              setCurrentPhaseIndex(0);
              setIsPlaying(false);
              setPlayProgress(0);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activePlay?.id === p.id
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {activePlay && currentPhase && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* LEFT: TOOLS PALETTE (Matching Images 1, 3, 4) */}
          <div className="space-y-4 lg:col-span-1">
            {/* Drawing Tools Palette */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 text-xs">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Herramientas de Dibujo
              </h3>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'select', label: 'Seleccionar', icon: MousePointer },
                  { id: 'arrow', label: 'Flecha Despl.', icon: ArrowRight },
                  { id: 'dashed_arrow', label: 'Sin Balón (---)', icon: Move },
                  { id: 'curve', label: 'Desmarque Curvo', icon: Move },
                  { id: 'pass_arrow', label: 'Pase de Balón', icon: ArrowRight },
                  { id: 'zone_box', label: 'Zona Sombreada', icon: BoxIcon },
                  { id: 'circle_area', label: 'Área Influencia', icon: Circle },
                  { id: 'text', label: 'Anotación Texto', icon: Type },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isActive = selectedTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id as ToolType)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors font-medium ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Color & Stroke */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Color Trazo:</span>
                  <div className="flex items-center gap-1.5">
                    {['#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#FFFFFF'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setActiveColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          activeColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Grosor:</span>
                  <div className="flex items-center gap-2">
                    {[2, 3, 5].map((w) => (
                      <button
                        key={w}
                        onClick={() => setStrokeWidth(w)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          strokeWidth === w ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Fichas */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-slate-400 block text-[11px] font-medium">Añadir Fichas:</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleAddToken('home')}
                    className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-center text-[11px]"
                  >
                    + Canarias
                  </button>
                  <button
                    onClick={() => handleAddToken('away')}
                    className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-center text-[11px]"
                  >
                    + Rival
                  </button>
                  <button
                    onClick={() => handleAddToken('ball')}
                    className="p-1.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-center text-[11px]"
                  >
                    + Balón
                  </button>
                </div>
              </div>

              {/* Delete Selection */}
              {(selectedTokenId || selectedDrawingId) && (
                <button
                  onClick={handleDeleteSelected}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold border border-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Elemento</span>
                </button>
              )}
            </div>

            {/* Token Inspector */}
            {selectedToken && (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-2">
                <h4 className="font-bold text-amber-400">Editar Ficha Seleccionada</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Dorsal</label>
                    <input
                      type="number"
                      value={selectedToken.number || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = {
                          ...activePlay,
                          phases: activePlay.phases.map((ph, idx) =>
                            idx === currentPhaseIndex
                              ? {
                                  ...ph,
                                  tokens: ph.tokens.map((t) =>
                                    t.id === selectedToken.id ? { ...t, number: val } : t
                                  ),
                                }
                              : ph
                          ),
                        };
                        setActivePlay(updated);
                      }}
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Nombre</label>
                    <input
                      type="text"
                      value={selectedToken.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = {
                          ...activePlay,
                          phases: activePlay.phases.map((ph, idx) =>
                            idx === currentPhaseIndex
                              ? {
                                  ...ph,
                                  tokens: ph.tokens.map((t) =>
                                    t.id === selectedToken.id ? { ...t, label: val } : t
                                  ),
                                }
                              : ph
                          ),
                        };
                        setActivePlay(updated);
                      }}
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CENTER: VECTOR TACTICAL PITCH (3 columns) */}
          <div className="lg:col-span-3 space-y-3">
            <div
              ref={boardRef}
              onMouseDown={handleBoardMouseDown}
              onMouseMove={handleBoardMouseMove}
              onMouseUp={handleBoardMouseUp}
              onTouchStart={handleBoardTouchStart}
              onTouchMove={handleBoardTouchMove}
              onTouchEnd={handleBoardTouchEnd}
              onTouchCancel={handleBoardTouchEnd}
              className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-700 bg-emerald-800 touch-none select-none cursor-${
                selectedTool === 'select' ? 'default' : 'crosshair'
              }`}
              style={{
                backgroundColor: '#166534',
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.025), rgba(255,255,255,0.025) 8%, transparent 8%, transparent 16%)',
              }}
            >
              {/* Pitch Markings SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none stroke-white/60"
                strokeWidth="2.5"
                fill="none"
              >
                {activePlay.pitchMode === 'half_attacking' ? (
                  // Half Pitch Representation (Goal at top)
                  <>
                    <rect x="5%" y="5%" width="90%" height="90%" />
                    <line x1="5%" y1="95%" x2="95%" y2="95%" strokeWidth="3" />
                    {/* Goal frame */}
                    <rect x="42%" y="1%" width="16%" height="4%" fill="rgba(255,255,255,0.2)" />
                    {/* Penalty box */}
                    <rect x="22%" y="5%" width="56%" height="28%" />
                    <rect x="36%" y="5%" width="28%" height="11%" />
                    <circle cx="50%" cy="22%" r="3.5" fill="white" />
                    <path d="M 40% 33% A 10% 10% 0 0 0 60% 33%" />
                    {/* Corner arcs */}
                    <path d="M 5% 10% A 4% 4% 0 0 0 9% 5%" />
                    <path d="M 95% 10% A 4% 4% 0 0 1 91% 5%" />
                  </>
                ) : (
                  // Full Pitch
                  <>
                    <rect x="4%" y="4%" width="92%" height="92%" />
                    <line x1="4%" y1="50%" x2="96%" y2="50%" />
                    <circle cx="50%" cy="50%" r="12%" />
                    <circle cx="50%" cy="50%" r="3" fill="white" />
                    <rect x="25%" y="4%" width="50%" height="18%" />
                    <rect x="25%" y="78%" width="50%" height="18%" />
                  </>
                )}

                {/* Persistent Tactical Drawings of the Current Phase */}
                {currentPhase.drawings.map((draw) => {
                  if (draw.points.length < 2) return null;
                  const pts = draw.points.map((p) => `${p.x}%,${p.y}%`).join(' ');
                  const first = draw.points[0];
                  const last = draw.points[draw.points.length - 1];

                  if (draw.type === 'zone_box') {
                    const minX = Math.min(...draw.points.map((p) => p.x));
                    const maxX = Math.max(...draw.points.map((p) => p.x));
                    const minY = Math.min(...draw.points.map((p) => p.y));
                    const maxY = Math.max(...draw.points.map((p) => p.y));
                    return (
                      <g key={draw.id}>
                        <rect
                          x={`${minX}%`}
                          y={`${minY}%`}
                          width={`${maxX - minX}%`}
                          height={`${maxY - minY}%`}
                          fill={draw.color}
                          fillOpacity="0.25"
                          stroke={draw.color}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        {draw.label && (
                          <text
                            x={`${minX + 2}%`}
                            y={`${minY + 6}%`}
                            fill={draw.color}
                            fontSize="11"
                            fontWeight="bold"
                          >
                            {draw.label}
                          </text>
                        )}
                      </g>
                    );
                  }

                  if (draw.type === 'curve') {
                    // Quadratic curve through midpoint
                    const mid = draw.points[Math.floor(draw.points.length / 2)];
                    return (
                      <g key={draw.id}>
                        <path
                          d={`M ${first.x}% ${first.y}% Q ${mid.x}% ${mid.y}% ${last.x}% ${last.y}%`}
                          stroke={draw.color}
                          strokeWidth={draw.strokeWidth}
                          fill="none"
                          markerEnd="url(#arrow-head)"
                        />
                      </g>
                    );
                  }

                  return (
                    <polyline
                      key={draw.id}
                      points={pts}
                      stroke={draw.color}
                      strokeWidth={draw.strokeWidth}
                      strokeDasharray={draw.type === 'dashed_arrow' ? '6 4' : undefined}
                      fill="none"
                    />
                  );
                })}

                {/* Marker defs for arrow heads */}
                <defs>
                  <marker
                    id="arrow-head"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M 0 0 L 6 3 L 0 6 z" fill={activeColor} />
                  </marker>
                </defs>
              </svg>

              {/* Tokens with Normalized Coordinates & Smooth Animation */}
              {currentPhase.tokens.map((rawToken) => {
                const token = getInterpolatedToken(rawToken);
                const isSelected = selectedTokenId === token.id;
                const isBall = token.team === 'ball';

                return (
                  <div
                    key={token.id}
                    style={{
                      left: `${token.x}%`,
                      top: `${token.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedTokenId(token.id);
                      setIsDraggingToken(true);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setSelectedTokenId(token.id);
                      setIsDraggingToken(true);
                    }}
                    className="absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform select-none"
                  >
                    {isBall ? (
                      <div
                        className={`w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-xl flex items-center justify-center font-bold text-[10px] text-slate-950 ${
                          isSelected ? 'ring-4 ring-amber-400' : ''
                        }`}
                      >
                        ⚽
                      </div>
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs shadow-xl border-2 transition-all ${
                          token.team === 'home'
                            ? 'bg-blue-600 text-white border-amber-400'
                            : 'bg-red-600 text-white border-white'
                        } ${isSelected ? 'ring-4 ring-amber-400 scale-110' : ''}`}
                      >
                        <span className="font-mono">{token.number ?? ''}</span>
                      </div>
                    )}

                    <span className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/85 backdrop-blur-sm text-[10px] font-semibold text-white truncate max-w-[80px] shadow border border-slate-700">
                      {token.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* TIMELINE & PLAYBACK CONTROLS (Exactly as in User Images 1, 3, 4) */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Playback Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentPhaseIndex(0);
                    setPlayProgress(0);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Reiniciar animación"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-emerald-500 text-white hover:bg-emerald-400'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Reproducir</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentPhaseIndex(0);
                    setPlayProgress(0);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Detener"
                >
                  <Square className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (currentPhaseIndex < activePlay.phases.length - 1) {
                      setCurrentPhaseIndex((prev) => prev + 1);
                      setPlayProgress(0);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Paso siguiente"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Timer Display */}
                <span className="font-mono text-amber-400 font-bold px-2 py-1 bg-slate-800 rounded border border-slate-700 ml-1">
                  00:{String(Math.floor(playProgress * (currentPhase?.durationSeconds || 3))).padStart(2, '0')} / 00:0{currentPhase?.durationSeconds || 3}
                </span>

                {/* Speed Toggle */}
                <button
                  onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 0.5 : 1))}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono font-bold hover:bg-slate-700 ml-1"
                >
                  {playbackSpeed}x
                </button>
              </div>

              {/* Phase Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {activePlay.phases.map((ph, idx) => (
                  <button
                    key={ph.id}
                    onClick={() => {
                      setCurrentPhaseIndex(idx);
                      setPlayProgress(0);
                      setIsPlaying(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      currentPhaseIndex === idx
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Fase {idx + 1}
                  </button>
                ))}

                {canEdit && (
                  <button
                    onClick={handleDuplicatePhase}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    title="Duplicar fase para continuar la jugada"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Fase</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tactical Instructions Panel */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-400">
                  {currentPhase.name}
                </h4>
                <span className="text-slate-400">Autor: {activePlay.author}</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                {currentPhase.description || activePlay.instructions}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
