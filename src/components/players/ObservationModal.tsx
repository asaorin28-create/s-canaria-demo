import React, { useState } from 'react';
import { Player, PositionCode } from '../../types';
import { useApp } from '../../context/AppContext';
import { POSITIONS_LIST } from '../../data/positions';
import { X, Check } from 'lucide-react';

interface Props {
  player: Player;
  onClose: () => void;
}

export const ObservationModal: React.FC<Props> = ({ player, onClose }) => {
  const { addObservation, currentUser } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [match, setMatch] = useState(`${player.clubName} vs `);
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState(player.competition);
  const [matchday, setMatchday] = useState(24);
  const [stadium, setStadium] = useState('');
  const [minutesWatched, setMinutesWatched] = useState(80);
  const [positionPlayed, setPositionPlayed] = useState<PositionCode>(player.primaryPosition);

  // Snapshot rating scores
  const [technicalAvg, setTechnicalAvg] = useState(8.5);
  const [tacticalAvg, setTacticalAvg] = useState(8.2);
  const [physicalAvg, setPhysicalAvg] = useState(8.0);
  const [mentalAvg, setMentalAvg] = useState(8.4);

  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [comments, setComments] = useState('');
  const [recommendations, setRecommendations] = useState('Recomendado para seguimiento en siguiente convocatoria.');
  const [videoUrl, setVideoUrl] = useState('');
  const [nextAction, setNextAction] = useState('Revisar en próxima jornada presencial');

  const overall = Number(
    (technicalAvg * 0.35 + tacticalAvg * 0.3 + physicalAvg * 0.2 + mentalAvg * 0.15).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addObservation({
      playerId: player.id,
      observerId: currentUser.id,
      observerName: currentUser.name,
      date,
      match: opponent ? `${player.clubName} vs ${opponent}` : match,
      opponent: opponent || 'Rival en competición',
      competition,
      matchday: Number(matchday),
      stadium: stadium || 'Campo de fútbol insular',
      minutesWatched: Number(minutesWatched),
      positionPlayed,
      ratingsSnapshot: {
        technicalAvg,
        tacticalAvg,
        physicalAvg,
        mentalAvg,
        overall,
      },
      strengths,
      weaknesses,
      comments,
      recommendations,
      videoUrl,
      nextAction,
      verified: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white font-display">
              Registrar Observación Presencial
            </h2>
            <p className="text-xs text-slate-400">
              Evaluando a: <strong className="text-amber-400">{player.name} {player.surname}</strong> ({player.clubName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Match Context */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              1. Contexto del Partido Observado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Equipo Rival</label>
                <input
                  type="text"
                  required
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="Ej. CD Tenerife"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Competición</label>
                <input
                  type="text"
                  required
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Instalación / Estadio</label>
                <input
                  type="text"
                  value={stadium}
                  onChange={(e) => setStadium(e.target.value)}
                  placeholder="Ej. Anexo Gran Canaria"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Minutos Observados</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={minutesWatched}
                  onChange={(e) => setMinutesWatched(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Posición Ocupada</label>
                <select
                  value={positionPlayed}
                  onChange={(e) => setPositionPlayed(e.target.value as PositionCode)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                >
                  {POSITIONS_LIST.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Ratings */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Calificación del Rendimiento (Escala 1 a 10)
              </h3>
              <span className="font-mono text-xs text-amber-300 font-bold">
                Nota Ponderada: {overall}/10
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rendimiento Técnico (35%)</span>
                  <span className="font-mono font-bold text-amber-400">{technicalAvg}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={technicalAvg}
                  onChange={(e) => setTechnicalAvg(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rendimiento Táctico (30%)</span>
                  <span className="font-mono font-bold text-blue-400">{tacticalAvg}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={tacticalAvg}
                  onChange={(e) => setTacticalAvg(Number(e.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rendimiento Físico (20%)</span>
                  <span className="font-mono font-bold text-emerald-400">{physicalAvg}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={physicalAvg}
                  onChange={(e) => setPhysicalAvg(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rendimiento Mental & Competitivo (15%)</span>
                  <span className="font-mono font-bold text-purple-400">{mentalAvg}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={mentalAvg}
                  onChange={(e) => setMentalAvg(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              3. Informe Cualitativo del Ojeador
            </h3>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Puntos Fuertes</label>
              <textarea
                rows={2}
                required
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Ej. Excelente visión periférica, desmarque entre líneas, dominio del juego con ambas piernas..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Aspectos a Mejorar</label>
              <textarea
                rows={2}
                required
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="Ej. Retorno defensivo tras pérdida, agresividad en duelos aéreos..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Comentarios Generales del Partido</label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Ej. Tuvo gran protagonismo en la victoria de su equipo. Actuó con personalidad..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Recomendación para Convocatoria</label>
                <input
                  type="text"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Próxima Acción Recomendada</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Enlace a Vídeo / VEO / Wyscout (Opcional)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://veo.co/matches/... o enlace de vídeo"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Sticky Footer Submit for Mobile & Desktop */}
          <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-end gap-3 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Observación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
