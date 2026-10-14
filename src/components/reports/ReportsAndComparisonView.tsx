import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Player } from '../../types';
import { calculateOverallRating, getStatusInfo } from '../../utils/exportUtils';
import {
  FileText,
  Printer,
  Download,
  Users,
  Star,
  Shield,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const ReportsAndComparisonView: React.FC = () => {
  const { players, observations } = useApp();

  const [mode, setMode] = useState<'individual' | 'compare'>('individual');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [comparePlayerIds, setComparePlayerIds] = useState<string[]>([
    players[0]?.id || '',
    players[1]?.id || '',
  ]);

  const primaryPlayer = players.find((p) => p.id === selectedPlayerId) || players[0];
  const comparedPlayers = players.filter((p) => comparePlayerIds.includes(p.id));

  // Compute Radar Chart Points for a player
  // Dimensions: Técnica, Táctica, Físico, Mental, Visión, Recuperación (scale 0-10)
  const getRadarMetrics = (p: Player) => {
    const tech = (p.ratings.control + p.ratings.shortPass + p.ratings.dribble) / 3;
    const tact = (p.ratings.tacticalUnderstanding + p.ratings.spaceOccupation + p.ratings.pressing) / 3;
    const phys = (p.ratings.speed + p.ratings.stamina + p.ratings.acceleration) / 3;
    const ment = (p.ratings.competitiveness + p.ratings.leadership + p.ratings.focus) / 3;
    const vision = p.ratings.vision;
    const recovery = p.ratings.recovery;

    return [
      { label: 'Técnica', val: Number(tech.toFixed(1)) },
      { label: 'Táctica', val: Number(tact.toFixed(1)) },
      { label: 'Físico', val: Number(phys.toFixed(1)) },
      { label: 'Mental', val: Number(ment.toFixed(1)) },
      { label: 'Visión', val: Number(vision.toFixed(1)) },
      { label: 'Recuperación', val: Number(recovery.toFixed(1)) },
    ];
  };

  // Convert radar values to SVG polygon points
  const getPolygonPoints = (metrics: { val: number }[], cx = 150, cy = 150, maxR = 100) => {
    return metrics
      .map((m, idx) => {
        const angle = (Math.PI * 2 / metrics.length) * idx - Math.PI / 2;
        const r = (m.val / 10) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const primaryMetrics = primaryPlayer ? getRadarMetrics(primaryPlayer) : [];
  const primaryOverall = primaryPlayer ? calculateOverallRating(primaryPlayer.ratings) : 0;
  const playerObs = observations.filter((o) => o.playerId === primaryPlayer?.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Informes Técnicos & Comparativa de Rendimiento</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              Wyscout / Pro Scouting
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dossier individual con radar biométrico y comparativa simultánea de 2 a 4 futbolistas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setMode('individual')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'individual'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Informe Individual
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'compare'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Comparador (2-4 Jugadores)
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Informe</span>
          </button>
        </div>
      </div>

      {mode === 'individual' && primaryPlayer && (
        <div className="space-y-6">
          {/* Player Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 shrink-0 font-medium">Futbolista:</span>
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlayerId(p.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedPlayerId === p.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.sportName} ({p.primaryPosition})
              </button>
            ))}
          </div>

          {/* Dossier Card (Matching Chelsea / Wyscout Images 2 & 6) */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl space-y-6">
            {/* Top Identity Grid */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 text-amber-300 font-bold text-3xl flex items-center justify-center overflow-hidden border-2 border-slate-700 shadow-md">
                  {primaryPlayer.photoUrl ? (
                    <img
                      src={primaryPlayer.photoUrl}
                      alt={primaryPlayer.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{primaryPlayer.name.charAt(0)}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white font-display">
                      {primaryPlayer.name} {primaryPlayer.surname}
                    </h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                      {primaryPlayer.primaryPosition}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="text-amber-400 font-semibold">{primaryPlayer.clubName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{primaryPlayer.category} ({primaryPlayer.gender})</span>
                    <span aria-hidden="true">·</span>
                    <span>{primaryPlayer.island}</span>
                    <span aria-hidden="true">·</span>
                    <span>Dorsal #{primaryPlayer.squadNumber}</span>
                  </div>
                </div>
              </div>

              {/* Global Index Metric */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs uppercase font-semibold text-slate-400 block">
                    Índice de Rendimiento
                  </span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                      {primaryOverall}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">/10</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Convocatorias
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    {primaryPlayer.convocatoriasCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Radar Chart + Traits Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Radar Chart SVG */}
              <div className="flex flex-col items-center">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Polígono de Rasgos Competitivos
                </h3>
                <div className="relative w-[300px] h-[300px]">
                  <svg className="w-full h-full" viewBox="0 0 300 300">
                    {/* Background concentric reference polygons (levels 2, 4, 6, 8, 10) */}
                    {[2, 4, 6, 8, 10].map((lvl) => {
                      const r = (lvl / 10) * 100;
                      const pts = primaryMetrics
                        .map((_, idx) => {
                          const angle = (Math.PI * 2 / primaryMetrics.length) * idx - Math.PI / 2;
                          const x = 150 + r * Math.cos(angle);
                          const y = 150 + r * Math.sin(angle);
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return (
                        <polygon
                          key={lvl}
                          points={pts}
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.15)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Radial axis lines */}
                    {primaryMetrics.map((_, idx) => {
                      const angle = (Math.PI * 2 / primaryMetrics.length) * idx - Math.PI / 2;
                      const x2 = 150 + 100 * Math.cos(angle);
                      const y2 = 150 + 100 * Math.sin(angle);
                      return (
                        <line
                          key={idx}
                          x1="150"
                          y1="150"
                          x2={x2}
                          y2={y2}
                          stroke="rgba(148, 163, 184, 0.2)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Player Polygon */}
                    <polygon
                      points={getPolygonPoints(primaryMetrics)}
                      fill="rgba(245, 158, 11, 0.35)"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                    />

                    {/* Metric Labels */}
                    {primaryMetrics.map((m, idx) => {
                      const angle = (Math.PI * 2 / primaryMetrics.length) * idx - Math.PI / 2;
                      const x = 150 + 120 * Math.cos(angle);
                      const y = 150 + 120 * Math.sin(angle);
                      return (
                        <text
                          key={idx}
                          x={x}
                          y={y}
                          fill="#CBD5E1"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {m.label} ({m.val})
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Trait KPIs */}
              <div className="space-y-4 text-xs">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Desglose de Aptitudes para la Selección
                </h3>

                <div className="space-y-3">
                  {primaryMetrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span>{m.label}</span>
                        <span className="font-mono font-bold text-amber-400">{m.val}/10</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                          style={{ width: `${(m.val / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mt-4">
                  <span className="text-amber-400 font-semibold block mb-1">
                    Dictamen Técnico del Responsable:
                  </span>
                  <p className="text-slate-300 italic leading-relaxed">
                    "{primaryPlayer.tacticalProfile || 'Futbolista con sólida proyección para el combinado insular.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Observations History Table */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Historial de Observaciones Presenciales ({playerObs.length})
              </h3>
              {playerObs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No hay observaciones presenciales aún.</p>
              ) : (
                <div className="space-y-2">
                  {playerObs.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {obs.match} ({obs.date})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Scout: {obs.observerName} · {obs.stadium} · {obs.minutesWatched}'
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400">
                          Nota: {obs.ratingsSnapshot.overall}/10
                        </span>
                        <span className="text-[10px] text-slate-500 block">{obs.recommendations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: COMPARATOR OF 2 TO 4 PLAYERS */}
      {mode === 'compare' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 text-xs">
            <h3 className="font-bold text-amber-400 uppercase tracking-wider">
              Seleccionar Futbolistas a Comparar (2 a 4)
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {players.map((p) => {
                const isSelected = comparePlayerIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        if (comparePlayerIds.length > 2) {
                          setComparePlayerIds(comparePlayerIds.filter((id) => id !== p.id));
                        }
                      } else {
                        if (comparePlayerIds.length < 4) {
                          setComparePlayerIds([...comparePlayerIds, p.id]);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {p.sportName} ({p.primaryPosition})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparedPlayers.map((p) => {
              const rating = calculateOverallRating(p.ratings);
              const metrics = getRadarMetrics(p);

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4 shadow-lg text-xs"
                >
                  <div className="text-center pb-3 border-b border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 font-bold text-xl flex items-center justify-center mx-auto overflow-hidden border border-slate-700 mb-2">
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
                    <h4 className="font-bold text-white text-sm truncate">{p.sportName}</h4>
                    <p className="text-slate-400 text-[11px] truncate">
                      {p.clubName} · {p.primaryPosition}
                    </p>
                    <div className="mt-2 text-2xl font-extrabold font-mono text-amber-400 tabular-nums">
                      {rating}
                      <span className="text-xs text-slate-500 font-normal ml-0.5">/10</span>
                    </div>
                  </div>

                  {/* Attributes breakdown */}
                  <div className="space-y-2">
                    {metrics.map((m) => (
                      <div key={m.label} className="flex justify-between items-center text-slate-300">
                        <span>{m.label}</span>
                        <span className="font-mono font-bold text-amber-400">{m.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p>
                      <strong>Pie:</strong> {p.dominantFoot}
                    </p>
                    <p>
                      <strong>Altura:</strong> {p.heightCm} cm
                    </p>
                    <p>
                      <strong>Isla:</strong> {p.island}
                    </p>
                    <p>
                      <strong>Convocatorias:</strong> {p.convocatoriasCount}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
