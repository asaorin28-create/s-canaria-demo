export type UserRole = 'admin' | 'coordinator' | 'selector' | 'scout' | 'coach' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  island: Island;
}

export type Island =
  | 'Gran Canaria'
  | 'Tenerife'
  | 'Lanzarote'
  | 'Fuerteventura'
  | 'La Palma'
  | 'La Gomera'
  | 'El Hierro';

export type AgeCategory = 'Sub-12' | 'Sub-14' | 'Sub-16' | 'Sub-18' | 'Senior';

export type Foot = 'Derecho' | 'Izquierdo' | 'Ambidiestro';

export type PositionCode =
  | 'POR' // Portero
  | 'DFC' // Defensa Central
  | 'LD'  // Lateral Derecho
  | 'LI'  // Lateral Izquierdo
  | 'CRD' // Carrilero Derecho
  | 'CRI' // Carrilero Izquierdo
  | 'MCD' // Mediocentro Defensivo
  | 'MC'  // Mediocentro
  | 'MD'  // Interior / Banda Derecha
  | 'MI'  // Interior / Banda Izquierda
  | 'MCO' // Mediapunta
  | 'ED'  // Extremo Derecho
  | 'EI'  // Extremo Izquierdo
  | 'DC'  // Delantero Centro
  | 'SD'; // Segundo Delantero

export interface PositionDef {
  code: PositionCode;
  name: string;
  category: 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero';
  defaultX: number; // percentage 0-100 on pitch
  defaultY: number; // percentage 0-100 on pitch
}

export type ScoutingStatus =
  | 'nuevo'
  | 'pendiente_observar'
  | 'observado_1'
  | 'en_seguimiento'
  | 'prioritario'
  | 'propuesto_convocatoria'
  | 'convocado'
  | 'evaluacion_adicional'
  | 'no_prioritario'
  | 'archivado';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  island: Island;
  municipality: string;
  category: string;
  contactName: string;
  contactEmail: string;
  stadium: string;
  crestColor: string;
}

export interface PlayerRatings {
  // Technical
  control: number;
  shortPass: number;
  longPass: number;
  dribble: number;
  crossing: number;
  finishing: number;
  heading: number;
  shooting: number;
  recovery: number;
  anticipation: number;
  vision: number;
  positioning: number;

  // Physical
  speed: number;
  acceleration: number;
  stamina: number;
  strength: number;
  agility: number;
  coordination: number;
  jumping: number;

  // Tactical
  tacticalUnderstanding: number;
  tacticalDiscipline: number;
  spaceOccupation: number;
  pressing: number;
  defTransition: number;
  offTransition: number;
  offTheBall: number;
  systemAdaptability: number;

  // Mental
  leadership: number;
  focus: number;
  competitiveness: number;
  communication: number;
  teamwork: number;
}

export interface Observation {
  id: string;
  playerId: string;
  observerId: string;
  observerName: string;
  date: string;
  match: string;
  opponent: string;
  competition: string;
  matchday?: number;
  stadium: string;
  minutesWatched: number;
  positionPlayed: PositionCode;
  ratingsSnapshot: {
    technicalAvg: number;
    tacticalAvg: number;
    physicalAvg: number;
    mentalAvg: number;
    overall: number;
  };
  strengths: string;
  weaknesses: string;
  comments: string;
  recommendations: string;
  videoUrl?: string;
  nextAction: string;
  verified: boolean;
}

export interface PlayerPositionDetail {
  position: PositionCode;
  comfort: number; // 1-10
  experience: number; // 1-10
}

export interface Player {
  id: string;
  internalCode: string; // e.g. CAN-2026-0042
  name: string;
  surname: string;
  sportName: string;
  photoUrl: string;
  birthDate: string; // YYYY-MM-DD
  calculatedAge: number;
  category: AgeCategory;
  gender: 'Masculino' | 'Femenino';
  clubId: string;
  clubName: string;
  previousClubs: string[];
  island: Island;
  municipality: string;
  competition: string;
  division: string;
  squadNumber: number;
  dominantFoot: Foot;
  heightCm: number;
  weightKg?: number;
  nationality: string;
  dateAdded: string;
  scoutLead: string;
  status: ScoutingStatus;
  isFavorite?: boolean;

  // Tactical
  primaryPosition: PositionCode;
  secondaryPositions: PlayerPositionDetail[];
  tacticalProfile: string; // e.g. 'Organizador creativo', 'Extremo desequilibrante', 'Central corrector'
  preferredSystems: string[]; // e.g. ['4-3-3', '4-2-3-1']

  // Ratings
  ratings: PlayerRatings;
  ratingsHistory: {
    date: string;
    overall: number;
    technicalAvg: number;
    tacticalAvg: number;
    physicalAvg: number;
    mentalAvg: number;
    scoutName: string;
  }[];

  // Contact (RGPD privacy protected)
  contactPhone?: string;
  contactEmail?: string;
  tutorName?: string;
  tutorConsentSigned?: boolean;

  // Historical
  convocatoriasCount: number;
  observationsCount: number;
  lastObservedDate?: string;
}

export interface ScoutingEvent {
  id: string;
  title: string;
  type: 'partido' | 'seguimiento' | 'entrenamiento' | 'concentracion' | 'reunion' | 'prueba' | 'torneo' | 'convocatoria';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  island: Island;
  responsiblePerson: string;
  relatedPlayerIds: string[];
  teamsInvolved: string;
  notes: string;
  status: 'pendiente' | 'completado' | 'cancelado';
}

export interface ConvocatoriaPlayerEntry {
  playerId: string;
  role: 'titular' | 'suplente' | 'reserva';
  status: 'confirmado' | 'pendiente' | 'baja';
  positionAssigned: PositionCode;
  notes?: string;
}

export interface Convocatoria {
  id: string;
  title: string;
  selectionCategory: string; // e.g. "Selección Canaria Sub-16 Masculina"
  ageCategory: AgeCategory;
  gender: 'Masculino' | 'Femenino';
  season: string; // "2025/2026"
  tournamentOrMatch: string;
  startDate: string;
  endDate?: string;
  location: string;
  headCoach: string;
  technicalStaff: string[];
  players: ConvocatoriaPlayerEntry[];
  status: 'borrador' | 'oficial' | 'cerrada';
  notes: string;
}

export interface LineupSlot {
  slotIndex: number;
  x: number; // 0 to 100 on pitch
  y: number; // 0 to 100 on pitch
  playerId?: string;
  customName?: string;
  number: number;
  position: PositionCode;
  instructions?: string;
  isCaptain?: boolean;
}

export interface Lineup {
  id: string;
  title: string;
  formation: '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '3-4-3' | '5-3-2' | 'personalizada';
  teamCategory: string;
  convocatoriaId?: string;
  matchDate: string;
  opponent?: string;
  starting11: LineupSlot[];
  substitutes: {
    playerId?: string;
    customName?: string;
    number: number;
    position: PositionCode;
  }[];
  tacticalNotes: string;
  isOfficial?: boolean;
}

// Tactical Board
export interface TacticalToken {
  id: string;
  team: 'home' | 'away' | 'ball';
  number?: number;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  playerId?: string;
}

export interface TacticalDrawing {
  id: string;
  type: 'arrow' | 'dashed_arrow' | 'curve' | 'pass_arrow' | 'dribble_line' | 'defensive_line' | 'zone_box' | 'circle_area' | 'text';
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  label?: string;
}

export interface TacticalPhase {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  tokens: TacticalToken[];
  drawings: TacticalDrawing[];
}

export interface TacticalPlay {
  id: string;
  title: string;
  category:
    | 'corners_ofensivos'
    | 'corners_defensivos'
    | 'faltas_directas'
    | 'faltas_indirectas'
    | 'saques_banda'
    | 'saque_centro'
    | 'salida_balon'
    | 'presion_alta'
    | 'bloque_medio'
    | 'bloque_bajo'
    | 'transiciones_of'
    | 'transiciones_def'
    | 'ataque_posicional'
    | 'contraataque'
    | 'personalizada';
  pitchMode: 'full' | 'half_attacking' | 'half_defending';
  orientation: 'horizontal' | 'vertical';
  description: string;
  instructions: string;
  author: string;
  date: string;
  tags: string[];
  phases: TacticalPhase[];
}

export interface GoogleSheetsSyncConfig {
  connected: boolean;
  sheetId: string;
  sheetUrl: string;
  lastSync?: string;
  autoSync: boolean;
  sheets: {
    name: string;
    rowsCount: number;
    status: 'synced' | 'pending' | 'error';
  }[];
  logs: {
    id: string;
    timestamp: string;
    operation: 'EXPORT' | 'IMPORT' | 'CHECK';
    status: 'success' | 'warning' | 'error';
    details: string;
    recordsAffected: number;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'jugador' | 'observacion' | 'convocatoria' | 'alineacion' | 'tactica' | 'sincronizacion' | 'seguridad';
  entityId?: string;
  details: string;
}
