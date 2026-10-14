import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScoutingEvent, Island } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  X,
  Check,
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, players, canEdit, currentUser } = useApp();

  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedIsland, setSelectedIsland] = useState<Island | 'todas'>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScoutingEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ScoutingEvent['type']>('partido');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [island, setIsland] = useState<Island>('Gran Canaria');
  const [responsiblePerson, setResponsiblePerson] = useState(currentUser.name);
  const [teamsInvolved, setTeamsInvolved] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ScoutingEvent['status']>('pendiente');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setType('partido');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('11:00');
    setLocation('');
    setIsland('Gran Canaria');
    setResponsiblePerson(currentUser.name);
    setTeamsInvolved('');
    setNotes('');
    setStatus('pendiente');
    setSelectedPlayerIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (evt: ScoutingEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setType(evt.type);
    setDate(evt.date);
    setTime(evt.time);
    setLocation(evt.location);
    setIsland(evt.island);
    setResponsiblePerson(evt.responsiblePerson);
    setTeamsInvolved(evt.teamsInvolved);
    setNotes(evt.notes);
    setStatus(evt.status);
    setSelectedPlayerIds(evt.relatedPlayerIds || []);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        title,
        type,
        date,
        time,
        location,
        island,
        responsiblePerson,
        teamsInvolved,
        notes,
        status,
        relatedPlayerIds: selectedPlayerIds,
      });
    } else {
      addEvent({
        title,
        type,
        date,
        time,
        location,
        island,
        responsiblePerson,
        teamsInvolved,
        notes,
        status,
        relatedPlayerIds: selectedPlayerIds,
      });
    }
    setIsModalOpen(false);
  };

  const filteredEvents = events
    .filter((e) => {
      if (selectedType !== 'todos' && e.type !== selectedType) return false;
      if (selectedIsland !== 'todas' && e.island !== selectedIsland) return false;
      if (selectedStatus !== 'todos' && e.status !== selectedStatus) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Agenda de Scouting & Actividades Federativas</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {filteredEvents.length} eventos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Planificación de observaciones presenciales, entrenamientos, concentraciones y torneos
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Programar Seguimiento</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        {/* Type */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Tipo:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
          >
            <option value="todos">Todos los tipos</option>
            <option value="partido">Observación de Partidos</option>
            <option value="seguimiento">Seguimiento Individual</option>
            <option value="entrenamiento">Entrenamientos</option>
            <option value="concentracion">Concentraciones</option>
            <option value="torneo">Torneos</option>
            <option value="reunion">Reuniones Técnicas</option>
          </select>
        </div>

        {/* Island */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Isla:</span>
          <select
            value={selectedIsland}
            onChange={(e) => setSelectedIsland(e.target.value as Island | 'todas')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
          >
            <option value="todas">Todas las islas</option>
            <option value="Gran Canaria">Gran Canaria</option>
            <option value="Tenerife">Tenerife</option>
            <option value="Lanzarote">Lanzarote</option>
            <option value="Fuerteventura">Fuerteventura</option>
            <option value="La Palma">La Palma</option>
            <option value="La Gomera">La Gomera</option>
            <option value="El Hierro">El Hierro</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Estado:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => {
          const related = players.filter((p) => evt.relatedPlayerIds?.includes(p.id));

          return (
            <div
              key={evt.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {evt.date} · {evt.time}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {evt.type}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {evt.location} ({evt.island})
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                  {evt.teamsInvolved && (
                    <p className="text-xs text-amber-300 font-medium mt-0.5">
                      Equipos implicados: {evt.teamsInvolved}
                    </p>
                  )}
                  {evt.notes && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {evt.notes}
                    </p>
                  )}
                </div>

                {/* Related Players Tag Pills */}
                {related.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                    <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Jugadores a seguir:
                    </span>
                    {related.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-medium text-[11px] border border-slate-700/60"
                      >
                        {p.sportName} ({p.primaryPosition})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    evt.status === 'completado'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : evt.status === 'cancelado'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {evt.status === 'completado'
                    ? 'Completado'
                    : evt.status === 'cancelado'
                    ? 'Cancelado'
                    : 'Pendiente'}
                </span>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(evt)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Editar
                    </button>
                    {evt.status === 'pendiente' && (
                      <button
                        onClick={() => updateEvent({ ...evt, status: 'completado' })}
                        className="p-1 text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                        title="Marcar como completado"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Create/Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-bold text-white font-display">
                {editingEvent ? 'Modificar Evento de Agenda' : 'Programar Nuevo Evento'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Observación UD Las Palmas vs CD Tenerife (Cadete)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Tipo de Evento</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ScoutingEvent['type'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="partido">Observación de Partido</option>
                    <option value="seguimiento">Seguimiento Individual</option>
                    <option value="entrenamiento">Entrenamiento</option>
                    <option value="concentracion">Concentración</option>
                    <option value="prueba">Prueba de Jugadores</option>
                    <option value="torneo">Torneo</option>
                    <option value="convocatoria">Convocatoria</option>
                    <option value="reunion">Reunión Técnica</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                  </input>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Instalación / Ubicación</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. Anexo Gran Canaria"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Isla</label>
                  <select
                    value={island}
                    onChange={(e) => setIsland(e.target.value as Island)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Gran Canaria">Gran Canaria</option>
                    <option value="Tenerife">Tenerife</option>
                    <option value="Lanzarote">Lanzarote</option>
                    <option value="Fuerteventura">Fuerteventura</option>
                    <option value="La Palma">La Palma</option>
                    <option value="La Gomera">La Gomera</option>
                    <option value="El Hierro">El Hierro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Responsable</label>
                  <input
                    type="text"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ScoutingEvent['status'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Equipos Implicados</label>
                <input
                  type="text"
                  value={teamsInvolved}
                  onChange={(e) => setTeamsInvolved(e.target.value)}
                  placeholder="Ej. UD Las Palmas Cadete vs Acodetti CF"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Notas / Objetivos del Seguimiento</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotaciones para el cuerpo técnico u ojeadores..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              {/* Link Players */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Futbolistas de Seguimiento Prioritario</label>
                <div className="max-h-36 overflow-y-auto p-2 rounded-lg bg-slate-800 border border-slate-700 space-y-1">
                  {players.map((p) => {
                    const isSelected = selectedPlayerIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-slate-700/60 cursor-pointer text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedPlayerIds((prev) =>
                                isSelected ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                              );
                            }}
                            className="rounded text-amber-400 bg-slate-900 border-slate-700"
                          />
                          <span className="font-medium text-white">{p.sportName}</span>
                          <span className="text-[11px] text-slate-400">
                            ({p.primaryPosition} · {p.clubName})
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">{p.category}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sticky Footer for Mobile & Desktop */}
              <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-end gap-3 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar en Agenda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
