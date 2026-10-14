import React, { useState } from 'react';
import { Player, PositionCode, Island, Foot, ScoutingStatus, AgeCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { POSITIONS_LIST } from '../../data/positions';
import { calculateAge } from '../../data/initialData';
import { X, Check } from 'lucide-react';

interface Props {
  initialPlayer?: Player | null;
  onClose: () => void;
}

export const PlayerFormModal: React.FC<Props> = ({ initialPlayer, onClose }) => {
  const { addPlayer, updatePlayer, clubs, currentUser } = useApp();

  const isEditing = Boolean(initialPlayer);

  const [name, setName] = useState(initialPlayer?.name || '');
  const [surname, setSurname] = useState(initialPlayer?.surname || '');
  const [sportName, setSportName] = useState(initialPlayer?.sportName || '');
  const [birthDate, setBirthDate] = useState(initialPlayer?.birthDate || '2010-06-15');
  const [gender, setGender] = useState<'Masculino' | 'Femenino'>(initialPlayer?.gender || 'Masculino');
  const [category, setCategory] = useState<AgeCategory>(initialPlayer?.category || 'Sub-16');
  const [clubId, setClubId] = useState(initialPlayer?.clubId || clubs[0]?.id || '');
  const [island, setIsland] = useState<Island>(initialPlayer?.island || 'Gran Canaria');
  const [municipality, setMunicipality] = useState(initialPlayer?.municipality || 'Las Palmas');
  const [competition, setCompetition] = useState(initialPlayer?.competition || 'Liga Cadete Autonómica');
  const [division, setDivision] = useState(initialPlayer?.division || 'Grupo 1');
  const [squadNumber, setSquadNumber] = useState<number>(initialPlayer?.squadNumber || 10);
  const [dominantFoot, setDominantFoot] = useState<Foot>(initialPlayer?.dominantFoot || 'Derecho');
  const [heightCm, setHeightCm] = useState<number>(initialPlayer?.heightCm || 174);
  const [weightKg, setWeightKg] = useState<number>(initialPlayer?.weightKg || 65);
  const [scoutLead, setScoutLead] = useState(initialPlayer?.scoutLead || currentUser.name);
  const [status, setStatus] = useState<ScoutingStatus>(initialPlayer?.status || 'nuevo');
  const [primaryPosition, setPrimaryPosition] = useState<PositionCode>(initialPlayer?.primaryPosition || 'MC');
  const [tacticalProfile, setTacticalProfile] = useState(initialPlayer?.tacticalProfile || '');
  const [tutorName, setTutorName] = useState(initialPlayer?.tutorName || '');
  const [contactPhone, setContactPhone] = useState(initialPlayer?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(initialPlayer?.contactEmail || '');
  const [tutorConsentSigned, setTutorConsentSigned] = useState(initialPlayer?.tutorConsentSigned ?? true);

  // Dynamic age calculation as birthDate changes
  const computedAge = calculateAge(birthDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !surname.trim()) return;

    const selectedClub = clubs.find((c) => c.id === clubId);
    const clubName = selectedClub ? selectedClub.name : 'Club Canario';

    if (isEditing && initialPlayer) {
      const updated: Player = {
        ...initialPlayer,
        name,
        surname,
        sportName: sportName || `${name} ${surname[0]}.`,
        birthDate,
        calculatedAge: computedAge,
        category,
        gender,
        clubId,
        clubName,
        island,
        municipality,
        competition,
        division,
        squadNumber,
        dominantFoot,
        heightCm,
        weightKg,
        scoutLead,
        status,
        primaryPosition,
        tacticalProfile,
        tutorName,
        contactPhone,
        contactEmail,
        tutorConsentSigned,
      };
      updatePlayer(updated);
    } else {
      addPlayer({
        internalCode: '',
        name,
        surname,
        sportName: sportName || `${name} ${surname[0]}.`,
        photoUrl: '',
        birthDate,
        category,
        gender,
        clubId,
        clubName,
        previousClubs: [],
        island,
        municipality,
        competition,
        division,
        squadNumber,
        dominantFoot,
        heightCm,
        weightKg,
        nationality: 'Española (Canarias)',
        scoutLead,
        status,
        isFavorite: false,
        primaryPosition,
        secondaryPositions: [],
        tacticalProfile,
        preferredSystems: ['4-3-3', '4-2-3-1'],
        ratings: {
          control: 7,
          shortPass: 7,
          longPass: 7,
          dribble: 7,
          crossing: 7,
          finishing: 7,
          heading: 6,
          shooting: 7,
          recovery: 7,
          anticipation: 7,
          vision: 7,
          positioning: 7,
          speed: 7,
          acceleration: 7,
          stamina: 7,
          strength: 7,
          agility: 7,
          coordination: 7,
          jumping: 7,
          tacticalUnderstanding: 7,
          tacticalDiscipline: 7,
          spaceOccupation: 7,
          pressing: 7,
          defTransition: 7,
          offTransition: 7,
          offTheBall: 7,
          systemAdaptability: 7,
          leadership: 7,
          focus: 7,
          competitiveness: 7,
          communication: 7,
          teamwork: 7,
        },
        ratingsHistory: [],
        tutorName,
        contactPhone,
        contactEmail,
        tutorConsentSigned,
        convocatoriasCount: 0,
        observationsCount: 0,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white font-display">
              {isEditing ? `Editar Ficha: ${initialPlayer?.sportName}` : 'Alta de Nuevo Futbolista'}
            </h2>
            <p className="text-xs text-slate-400">
              Censo de futbolistas de las Selecciones Canarias de Fútbol
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
          {/* Section 1: Identification */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              1. Datos de Identificación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Dariam"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Ej. Rodríguez Santana"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nombre Deportivo</label>
                <input
                  type="text"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                  placeholder="Ej. Dariam"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Edad Calculada</label>
                <input
                  type="text"
                  readOnly
                  value={`${computedAge} años`}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-amber-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AgeCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Sub-12">Sub-12</option>
                  <option value="Sub-14">Sub-14</option>
                  <option value="Sub-16">Sub-16</option>
                  <option value="Sub-18">Sub-18</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Género</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Masculino' | 'Femenino')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Club & Geography */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              2. Club, Isla y Competición
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Club Actual</label>
                <select
                  value={clubId}
                  onChange={(e) => {
                    setClubId(e.target.value);
                    const selected = clubs.find((c) => c.id === e.target.value);
                    if (selected) {
                      setIsland(selected.island);
                      setMunicipality(selected.municipality);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.island})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Isla</label>
                <select
                  value={island}
                  onChange={(e) => setIsland(e.target.value as Island)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
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
              <div>
                <label className="text-slate-300 font-medium block mb-1">Municipio</label>
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Competición</label>
                <input
                  type="text"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  placeholder="Ej. Liga Cadete Autonómica"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">División / Grupo</label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="Ej. Cadete Autonómica Grupo 1"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Posición y Características */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              3. Posición Táctica & Atributos Físicos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Posición Principal</label>
                <select
                  value={primaryPosition}
                  onChange={(e) => setPrimaryPosition(e.target.value as PositionCode)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                >
                  {POSITIONS_LIST.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Pie Dominante</label>
                <select
                  value={dominantFoot}
                  onChange={(e) => setDominantFoot(e.target.value as Foot)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Derecho">Derecho</option>
                  <option value="Izquierdo">Izquierdo</option>
                  <option value="Ambidiestro">Ambidiestro</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Dorsal Habitual</label>
                <input
                  type="number"
                  value={squadNumber}
                  onChange={(e) => setSquadNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Estado de Seguimiento</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ScoutingStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="pendiente_observar">Pendiente de observar</option>
                  <option value="observado_1">Observado por 1ª vez</option>
                  <option value="en_seguimiento">En seguimiento</option>
                  <option value="prioritario">Prioritario</option>
                  <option value="propuesto_convocatoria">Propuesto para convocatoria</option>
                  <option value="convocado">Convocado</option>
                  <option value="evaluacion_adicional">En evaluación adicional</option>
                  <option value="no_prioritario">No prioritario actualmente</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Scout Responsable</label>
                <input
                  type="text"
                  value={scoutLead}
                  onChange={(e) => setScoutLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-slate-300 font-medium block mb-1">Descripción del Perfil Táctico</label>
              <textarea
                rows={2}
                value={tacticalProfile}
                onChange={(e) => setTacticalProfile(e.target.value)}
                placeholder="Ej. Central zurdo con jerarquía y salida limpia de balón..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 4: Privacy & RGPD */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              4. Contacto de Tutor Legal (RGPD Menores de Edad)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nombre del Tutor</label>
                <input
                  type="text"
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Ej. Padre / Madre / Tutor"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Teléfono Móvil</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+34 600 00 00 00"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="tutor@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={tutorConsentSigned}
                onChange={(e) => setTutorConsentSigned(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 focus:ring-0 bg-slate-800 border-slate-700"
              />
              <span className="text-slate-300 text-xs">
                Autorización federativa y consentimiento expreso de tratamiento de datos de menor firmado
              </span>
            </label>
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
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Jugador'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
