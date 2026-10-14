import React, { useState } from 'react';
import { Player, Observation } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateOverallRating, getStatusInfo } from '../../utils/exportUtils';
import {
  X,
  Star,
  Shield,
  MapPin,
  Calendar,
  Eye,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Lock,
  Compass,
  FileCheck,
} from 'lucide-react';

interface Props {
  player: Player;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<Props> = ({ player, onClose }) => {
  const {
    observations,
    setObservationModalPlayer,
    setEditingPlayer,
    deletePlayer,
    toggleFavoritePlayer,
    canEdit,
    canViewRestrictedData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'positions' | 'ratings' | 'observations'>('general');

  const playerObservations = observations.filter((o) => o.playerId === player.id);
  const overallRating = calculateOverallRating(player.ratings);
  const statusInfo = getStatusInfo(player.status);

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de archivar la ficha de ${player.name} ${player.surname}?`)) {
      deletePlayer(player.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold border border-slate-700">
              {player.internalCode}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
              {statusInfo.label}
            </span>
            {player.isFavorite && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setEditingPlayer(player);
                    onClose();
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Editar jugador"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Archivar jugador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 text-amber-300 font-bold text-2xl flex items-center justify-center overflow-hidden border border-slate-700 shrink-0">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{player.name.charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white font-display">
                    {player.name} {player.surname}
                  </h2>
                  <span className="text-xs text-slate-400">({player.sportName})</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                  <span className="text-amber-400 font-semibold">{player.clubName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{player.category} ({player.gender})</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {player.island}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Dorsal #{player.squadNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Índice Técnico
                </span>
                <span className="text-2xl font-extrabold font-mono text-amber-400 tabular-nums">
                  {overallRating}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">/10</span>
              </div>
              <button
                onClick={() => toggleFavoritePlayer(player.id)}
                className={`p-2 rounded-lg border transition-colors ${
                  player.isFavorite
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-400'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={player.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Star className={`w-5 h-5 ${player.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 mt-5 border-b border-slate-800 -mb-5 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: 'general', label: 'Ficha General' },
              { id: 'positions', label: 'Posición & Táctica' },
              { id: 'ratings', label: 'Atributos & Radar' },
              { id: 'observations', label: `Seguimientos (${playerObservations.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400">Fecha de Nacimiento</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {player.birthDate} ({player.calculatedAge} años)
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400">Pie Dominante</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {player.dominantFoot}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400">Altura / Peso</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {player.heightCm} cm {player.weightKg ? `· ${player.weightKg} kg` : ''}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400">Competición Actual</span>
                  <p className="text-sm font-semibold text-white mt-1 truncate">
                    {player.competition}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{player.division}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400">Scout Asignado</span>
                  <p className="text-sm font-semibold text-white mt-1 truncate">
                    {player.scoutLead}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400">Fecha de Alta</span>
                  <p className="text-sm font-semibold text-white mt-1 font-mono">
                    {player.dateAdded}
                  </p>
                </div>
              </div>

              {/* Clubes Anteriores */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Historial de Clubes & Trayectoria
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 font-semibold text-xs border border-amber-400/20">
                    Actual: {player.clubName}
                  </span>
                  {player.previousClubs?.map((club, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700"
                    >
                      Anterior: {club}
                    </span>
                  ))}
                  {(!player.previousClubs || player.previousClubs.length === 0) && (
                    <span className="text-xs text-slate-500">Club formativo único registrado.</span>
                  )}
                </div>
              </div>

              {/* RGPD & Minor Protection Section */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Protección de Datos & Contacto de Menores (RGPD)
                  </h4>
                  {player.tutorConsentSigned ? (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <FileCheck className="w-3.5 h-3.5" />
                      Consentimiento Tutor Firmado
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">
                      Consentimiento Pendiente
                    </span>
                  )}
                </div>

                {canViewRestrictedData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 mt-2">
                    <div>
                      <span className="text-slate-500 block">Tutor Legal</span>
                      <span className="font-medium text-white">{player.tutorName || 'No especificado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Teléfono de Contacto</span>
                      <span className="font-mono text-white">{player.contactPhone || 'Privado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email Institucional</span>
                      <span className="font-mono text-white">{player.contactEmail || 'Privado'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">
                    Los datos de contacto personales de futbolistas menores están protegidos y sólo son accesibles para Administradores y Coordinadores.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POSITIONS & TACTICAL PROFILE */}
          {activeTab === 'positions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">
                  Perfil Táctico Principal
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {player.tacticalProfile || 'Perfil polivalente con capacidad de adaptación.'}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Sistemas Tácticos Idóneos:</span>
                  {player.preferredSystems?.map((sys, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-xs border border-slate-700"
                    >
                      {sys}
                    </span>
                  ))}
                </div>
              </div>

              {/* Positions Comfort Matrix */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">
                  Polivalencia de Posiciones Registradas
                </h4>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                        Posición Principal
                      </span>
                      <span className="text-sm font-bold text-white">
                        {player.primaryPosition}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-300 bg-amber-400/20 px-2 py-1 rounded">
                      Especialista Titular
                    </span>
                  </div>

                  {player.secondaryPositions?.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block">
                          Posición Secundaria {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {sec.position}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Comodidad</span>
                          <span className="font-mono font-bold text-amber-400">{sec.comfort}/10</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Experiencia</span>
                          <span className="font-mono font-bold text-blue-400">{sec.experience}/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RATINGS & SKILLS (1-10 Scale) */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              {/* Formula & Weight explanation */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300">Fórmula de Puntuación Global:</span>{' '}
                  Técnica (35%) + Táctica (30%) + Físico (20%) + Mental (15%) ={' '}
                  <strong className="text-amber-400 font-mono text-sm">{overallRating}/10</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical Skills */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    Atributos Técnicos
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Control Orientado', val: player.ratings.control },
                      { label: 'Pase Corto', val: player.ratings.shortPass },
                      { label: 'Pase Largo', val: player.ratings.longPass },
                      { label: 'Regate / 1v1', val: player.ratings.dribble },
                      { label: 'Centros', val: player.ratings.crossing },
                      { label: 'Finalización', val: player.ratings.finishing },
                      { label: 'Juego Aéreo', val: player.ratings.heading },
                      { label: 'Visión de Juego', val: player.ratings.vision },
                      { label: 'Recuperación', val: player.ratings.recovery },
                    ].map((attr) => (
                      <div key={attr.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{attr.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${(attr.val / 10) * 100}%` }}
                            />
                          </div>
                          <span className="w-5 text-right font-mono font-bold text-white tabular-nums">
                            {attr.val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Skills */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                    Atributos Tácticos
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Comprensión Táctica', val: player.ratings.tacticalUnderstanding },
                      { label: 'Disciplina Táctica', val: player.ratings.tacticalDiscipline },
                      { label: 'Ocupación de Espacios', val: player.ratings.spaceOccupation },
                      { label: 'Presión tras Pérdida', val: player.ratings.pressing },
                      { label: 'Transición Defensiva', val: player.ratings.defTransition },
                      { label: 'Transición Ofensiva', val: player.ratings.offTransition },
                      { label: 'Juego sin Balón', val: player.ratings.offTheBall },
                      { label: 'Adaptabilidad de Sistema', val: player.ratings.systemAdaptability },
                    ].map((attr) => (
                      <div key={attr.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{attr.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-blue-400 rounded-full"
                              style={{ width: `${(attr.val / 10) * 100}%` }}
                            />
                          </div>
                          <span className="w-5 text-right font-mono font-bold text-white tabular-nums">
                            {attr.val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical Skills */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    Capacidades Físicas
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Velocidad Punta', val: player.ratings.speed },
                      { label: 'Aceleración / Explosividad', val: player.ratings.acceleration },
                      { label: 'Resistencia Aeróbica', val: player.ratings.stamina },
                      { label: 'Fuerza en el Duelo', val: player.ratings.strength },
                      { label: 'Agilidad / Cambio de Ritmo', val: player.ratings.agility },
                      { label: 'Salto / Impulso', val: player.ratings.jumping },
                    ].map((attr) => (
                      <div key={attr.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{attr.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${(attr.val / 10) * 100}%` }}
                            />
                          </div>
                          <span className="w-5 text-right font-mono font-bold text-white tabular-nums">
                            {attr.val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mental Skills */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                    Aspectos Mentales & Competitivos
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Liderazgo en el Campo', val: player.ratings.leadership },
                      { label: 'Concentración y Foco', val: player.ratings.focus },
                      { label: 'Personalidad Competitiva', val: player.ratings.competitiveness },
                      { label: 'Comunicación en Partido', val: player.ratings.communication },
                      { label: 'Trabajo Colectivo', val: player.ratings.teamwork },
                    ].map((attr) => (
                      <div key={attr.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{attr.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-purple-400 rounded-full"
                              style={{ width: `${(attr.val / 10) * 100}%` }}
                            />
                          </div>
                          <span className="w-5 text-right font-mono font-bold text-white tabular-nums">
                            {attr.val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OBSERVATIONS */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Historial de Observaciones Presenciales
                  </h4>
                  <p className="text-xs text-slate-400">
                    Informes técnicos elaborados por ojeadores de la Federación Canaria
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setObservationModalPlayer(player)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Observación</span>
                  </button>
                )}
              </div>

              {playerObservations.length === 0 ? (
                <div className="text-center py-8 p-6 rounded-xl border border-dashed border-slate-800 text-slate-400">
                  <Eye className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">No hay observaciones registradas aún para este futbolista.</p>
                  {canEdit && (
                    <button
                      onClick={() => setObservationModalPlayer(player)}
                      className="mt-3 text-xs text-amber-400 hover:underline font-medium"
                    >
                      Registrar primer seguimiento presencial
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {playerObservations.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-semibold">{obs.date}</span>
                          <span className="text-slate-400">· {obs.match}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-700 font-mono font-bold text-white tabular-nums">
                          Nota: {obs.ratingsSnapshot.overall}/10
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="text-slate-500 block">Scout:</span>
                          <span className="text-slate-200">{obs.observerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Instalación:</span>
                          <span className="text-slate-200">{obs.stadium}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Minutos:</span>
                          <span className="text-slate-200">{obs.minutesWatched}'</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Posición:</span>
                          <span className="text-slate-200">{obs.positionPlayed}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-slate-300">
                          <strong className="text-emerald-400 font-medium">Puntos Fuertes:</strong>{' '}
                          {obs.strengths}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-amber-400 font-medium">A Mejorar:</strong>{' '}
                          {obs.weaknesses}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-blue-400 font-medium">Comentarios:</strong>{' '}
                          {obs.comments}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-purple-400 font-medium">Recomendación:</strong>{' '}
                          {obs.recommendations}
                        </p>
                      </div>

                      {obs.videoUrl && (
                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <a
                            href={obs.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver corte de vídeo / highlights
                          </a>
                          <span className="text-[10px] text-slate-500">Próxima acción: {obs.nextAction}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Ficha ID: {player.id} · Convocatorias: {player.convocatoriasCount}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
