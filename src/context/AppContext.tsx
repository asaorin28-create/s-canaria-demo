import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Player,
  Observation,
  ScoutingEvent,
  Convocatoria,
  Lineup,
  TacticalPlay,
  User,
  GoogleSheetsSyncConfig,
  AuditLog,
  Club,
} from '../types';
import {
  INITIAL_PLAYERS,
  INITIAL_OBSERVATIONS,
  INITIAL_EVENTS,
  INITIAL_CONVOCATORIAS,
  INITIAL_LINEUPS,
  INITIAL_TACTICAL_PLAYS,
  INITIAL_USERS,
  INITIAL_SHEETS_CONFIG,
  INITIAL_AUDIT_LOGS,
  CANARY_CLUBS,
  calculateAge,
} from '../data/initialData';

export type NavigationTab =
  | 'dashboard'
  | 'players'
  | 'agenda'
  | 'convocatorias'
  | 'lineups'
  | 'tactics'
  | 'reports'
  | 'sheets'
  | 'audit';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  // Navigation & Theme
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sidebarHidden: boolean;
  setSidebarHidden: (hidden: boolean) => void;
  sidebarMode: 'expanded' | 'collapsed' | 'hidden';
  setSidebarMode: (mode: 'expanded' | 'collapsed' | 'hidden') => void;
  toggleSidebarMode: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Active User & Permissions
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  canEdit: boolean;
  canManageUsers: boolean;
  canViewRestrictedData: boolean;

  // Data Collections
  players: Player[];
  clubs: Club[];
  observations: Observation[];
  events: ScoutingEvent[];
  convocatorias: Convocatoria[];
  lineups: Lineup[];
  tacticalPlays: TacticalPlay[];
  sheetsConfig: GoogleSheetsSyncConfig;
  auditLogs: AuditLog[];

  // Mutators
  addPlayer: (player: Omit<Player, 'id' | 'calculatedAge' | 'dateAdded'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  toggleFavoritePlayer: (playerId: string) => void;

  addObservation: (obs: Omit<Observation, 'id'>) => void;
  deleteObservation: (obsId: string) => void;

  addEvent: (event: Omit<ScoutingEvent, 'id'>) => void;
  updateEvent: (event: ScoutingEvent) => void;
  deleteEvent: (eventId: string) => void;

  addConvocatoria: (conv: Omit<Convocatoria, 'id'>) => void;
  updateConvocatoria: (conv: Convocatoria) => void;
  deleteConvocatoria: (convId: string) => void;

  addLineup: (lineup: Omit<Lineup, 'id'>) => void;
  updateLineup: (lineup: Lineup) => void;
  deleteLineup: (lineupId: string) => void;

  addTacticalPlay: (play: Omit<TacticalPlay, 'id'>) => void;
  updateTacticalPlay: (play: TacticalPlay) => void;
  deleteTacticalPlay: (playId: string) => void;

  // Google Sheets
  syncWithSheets: () => Promise<void>;
  importFromSheets: (importedPlayers: Partial<Player>[]) => { added: number; updated: number; errors: string[] };
  updateSheetsConfig: (cfg: Partial<GoogleSheetsSyncConfig>) => void;

  // Active Modals & Selection state
  selectedPlayer: Player | null;
  setSelectedPlayer: (p: Player | null) => void;
  observationModalPlayer: Player | null;
  setObservationModalPlayer: (p: Player | null) => void;
  isCreatePlayerOpen: boolean;
  setIsCreatePlayerOpen: (open: boolean) => void;
  editingPlayer: Player | null;
  setEditingPlayer: (p: Player | null) => void;

  // Global Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Reset to sample defaults
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PLAYERS = 'scoutcanarias_players_v1';
const STORAGE_KEY_OBS = 'scoutcanarias_observations_v1';
const STORAGE_KEY_EVENTS = 'scoutcanarias_events_v1';
const STORAGE_KEY_CONV = 'scoutcanarias_convocatorias_v1';
const STORAGE_KEY_LINEUPS = 'scoutcanarias_lineups_v1';
const STORAGE_KEY_TACTICS = 'scoutcanarias_tactics_v1';
const STORAGE_KEY_SHEETS = 'scoutcanarias_sheets_v1';
const STORAGE_KEY_AUDIT = 'scoutcanarias_audit_v1';
const STORAGE_KEY_USER = 'scoutcanarias_user_v1';
const STORAGE_KEY_THEME = 'scoutcanarias_theme_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light') || 'dark';
  });
  const [sidebarMode, setSidebarMode] = useState<'expanded' | 'collapsed' | 'hidden'>('expanded');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const sidebarCollapsed = sidebarMode === 'collapsed';
  const sidebarHidden = sidebarMode === 'hidden';

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarMode(collapsed ? 'collapsed' : 'expanded');
  };

  const setSidebarHidden = (hidden: boolean) => {
    setSidebarMode(hidden ? 'hidden' : 'expanded');
  };

  const toggleSidebarMode = () => {
    // Cycle between expanded -> collapsed -> hidden
    setSidebarMode((prev) => {
      if (prev === 'expanded') return 'collapsed';
      if (prev === 'collapsed') return 'hidden';
      return 'expanded';
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Users & Permissions
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Andrés Morales (Coordinator)
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    addToast({
      type: 'info',
      title: `Sesión activa: ${user.name}`,
      message: `Rol asignado: ${user.role.toUpperCase()} · ${user.island}`,
    });
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  };

  // Primary Collections with LocalStorage caching
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (saved) {
      try {
        const parsed: Player[] = JSON.parse(saved);
        // recalculate age dynamically
        return parsed.map((p) => ({ ...p, calculatedAge: calculateAge(p.birthDate) }));
      } catch (e) {
        console.error('Failed to parse cached players', e);
      }
    }
    return INITIAL_PLAYERS;
  });

  const [clubs] = useState<Club[]>(CANARY_CLUBS);

  const [observations, setObservations] = useState<Observation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OBS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_OBSERVATIONS;
  });

  const [events, setEvents] = useState<ScoutingEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_EVENTS;
  });

  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONV);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_CONVOCATORIAS;
  });

  const [lineups, setLineups] = useState<Lineup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LINEUPS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_LINEUPS;
  });

  const [tacticalPlays, setTacticalPlays] = useState<TacticalPlay[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TACTICS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TACTICAL_PLAYS;
  });

  const [sheetsConfig, setSheetsConfigState] = useState<GoogleSheetsSyncConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHEETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_SHEETS_CONFIG;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Modal / detail states
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [observationModalPlayer, setObservationModalPlayer] = useState<Player | null>(null);
  const [isCreatePlayerOpen, setIsCreatePlayerOpen] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OBS, JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONV, JSON.stringify(convocatorias));
  }, [convocatorias]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LINEUPS, JSON.stringify(lineups));
  }, [lineups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TACTICS, JSON.stringify(tacticalPlays));
  }, [tacticalPlays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHEETS, JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Roles permissions
  const canEdit = currentUser.role !== 'viewer';
  const canManageUsers = currentUser.role === 'admin' || currentUser.role === 'coordinator';
  const canViewRestrictedData = currentUser.role === 'admin' || currentUser.role === 'coordinator' || currentUser.role === 'selector';

  // Audit helper
  const logAudit = (action: string, entityType: AuditLog['entityType'], details: string, entityId?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // PLAYER MUTATIONS
  const addPlayer = (newPlayerData: Omit<Player, 'id' | 'calculatedAge' | 'dateAdded'>) => {
    const id = `ply-${Date.now()}`;
    const calculatedAge = calculateAge(newPlayerData.birthDate);
    const dateAdded = new Date().toISOString().split('T')[0];
    const internalCode = `CAN-${new Date().getFullYear()}-${String(players.length + 1).padStart(3, '0')}`;

    const player: Player = {
      ...newPlayerData,
      id,
      internalCode: newPlayerData.internalCode || internalCode,
      calculatedAge,
      dateAdded,
      convocatoriasCount: 0,
      observationsCount: 0,
    };

    setPlayers((prev) => [player, ...prev]);
    logAudit('Alta de futbolista', 'jugador', `Registrado ${player.name} ${player.surname} (${player.internalCode})`, player.id);
    addToast({
      type: 'success',
      title: 'Jugador añadido',
      message: `${player.name} ${player.surname} registrado correctamente en la base de datos federativa.`,
    });
  };

  const updatePlayer = (updated: Player) => {
    const calculatedAge = calculateAge(updated.birthDate);
    const fixed = { ...updated, calculatedAge };
    setPlayers((prev) => prev.map((p) => (p.id === fixed.id ? fixed : p)));
    if (selectedPlayer && selectedPlayer.id === fixed.id) {
      setSelectedPlayer(fixed);
    }
    logAudit('Modificación de futbolista', 'jugador', `Actualizada ficha de ${fixed.name} ${fixed.surname}`, fixed.id);
    addToast({
      type: 'success',
      title: 'Ficha actualizada',
      message: `Los cambios en la ficha de ${fixed.sportName} han sido guardados.`,
    });
  };

  const deletePlayer = (playerId: string) => {
    const p = players.find((pl) => pl.id === playerId);
    setPlayers((prev) => prev.filter((pl) => pl.id !== playerId));
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(null);
    }
    if (p) {
      logAudit('Baja de futbolista', 'jugador', `Eliminado jugador ${p.name} ${p.surname}`, playerId);
      addToast({
        type: 'info',
        title: 'Jugador archivado',
        message: `${p.sportName} ha sido retirado de la base de datos activa.`,
      });
    }
  };

  const toggleFavoritePlayer = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const nextFav = !p.isFavorite;
          return { ...p, isFavorite: nextFav };
        }
        return p;
      })
    );
  };

  // OBSERVATIONS MUTATIONS
  const addObservation = (obsData: Omit<Observation, 'id'>) => {
    const id = `obs-${Date.now()}`;
    const newObs: Observation = { ...obsData, id };

    setObservations((prev) => [newObs, ...prev]);

    // Update player counts and last observed date
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === newObs.playerId) {
          const obsCount = (p.observationsCount || 0) + 1;
          const ratingsHistory = [
            ...(p.ratingsHistory || []),
            {
              date: newObs.date,
              overall: newObs.ratingsSnapshot.overall,
              technicalAvg: newObs.ratingsSnapshot.technicalAvg,
              tacticalAvg: newObs.ratingsSnapshot.tacticalAvg,
              physicalAvg: newObs.ratingsSnapshot.physicalAvg,
              mentalAvg: newObs.ratingsSnapshot.mentalAvg,
              scoutName: newObs.observerName,
            },
          ];
          return {
            ...p,
            observationsCount: obsCount,
            lastObservedDate: newObs.date,
            status: p.status === 'nuevo' || p.status === 'pendiente_observar' ? 'observado_1' : p.status,
            ratingsHistory,
          };
        }
        return p;
      })
    );

    logAudit('Registro de observación técnica', 'observacion', `Nueva observación técnica en ${newObs.match}`, id);
    addToast({
      type: 'success',
      title: 'Observación guardada',
      message: 'Informe de seguimiento presencial registrado correctamente.',
    });
  };

  const deleteObservation = (obsId: string) => {
    const obs = observations.find((o) => o.id === obsId);
    setObservations((prev) => prev.filter((o) => o.id !== obsId));
    if (obs) {
      logAudit('Eliminación de observación', 'observacion', `Eliminado informe de observación ${obsId}`, obsId);
      addToast({
        type: 'info',
        title: 'Observación eliminada',
      });
    }
  };

  // EVENTS MUTATIONS
  const addEvent = (evtData: Omit<ScoutingEvent, 'id'>) => {
    const id = `evt-${Date.now()}`;
    const newEvt: ScoutingEvent = { ...evtData, id };
    setEvents((prev) => [...prev, newEvt]);
    logAudit('Creación de evento de agenda', 'seguridad', `Programado evento: ${newEvt.title}`, id);
    addToast({
      type: 'success',
      title: 'Evento programado',
      message: `${newEvt.title} añadido a la agenda de scouting.`,
    });
  };

  const updateEvent = (updated: ScoutingEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    logAudit('Actualización de evento', 'seguridad', `Modificado evento: ${updated.title}`, updated.id);
    addToast({
      type: 'success',
      title: 'Evento actualizado',
    });
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    addToast({ type: 'info', title: 'Evento eliminado' });
  };

  // CONVOCATORIAS MUTATIONS
  const addConvocatoria = (convData: Omit<Convocatoria, 'id'>) => {
    const id = `conv-${Date.now()}`;
    const newConv: Convocatoria = { ...convData, id };
    setConvocatorias((prev) => [newConv, ...prev]);

    // Update convocatorias count for players
    const calledPlayerIds = new Set(newConv.players.map((p) => p.playerId));
    setPlayers((prev) =>
      prev.map((p) => {
        if (calledPlayerIds.has(p.id)) {
          return {
            ...p,
            convocatoriasCount: (p.convocatoriasCount || 0) + 1,
            status: 'convocado',
          };
        }
        return p;
      })
    );

    logAudit('Creación de convocatoria', 'convocatoria', `Generada lista de ${newConv.selectionCategory}`, id);
    addToast({
      type: 'success',
      title: 'Convocatoria creada',
      message: `${newConv.title} guardada con ${newConv.players.length} futbolistas.`,
    });
  };

  const updateConvocatoria = (updated: Convocatoria) => {
    setConvocatorias((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    logAudit('Actualización de convocatoria', 'convocatoria', `Actualizada ${updated.title}`, updated.id);
    addToast({
      type: 'success',
      title: 'Convocatoria actualizada',
    });
  };

  const deleteConvocatoria = (convId: string) => {
    setConvocatorias((prev) => prev.filter((c) => c.id !== convId));
    addToast({ type: 'info', title: 'Convocatoria eliminada' });
  };

  // LINEUPS MUTATIONS
  const addLineup = (lineupData: Omit<Lineup, 'id'>) => {
    const id = `lineup-${Date.now()}`;
    const newLineup: Lineup = { ...lineupData, id };
    setLineups((prev) => [newLineup, ...prev]);
    logAudit('Diseño de once inicial', 'alineacion', `Creado once ${newLineup.title} (${newLineup.formation})`, id);
    addToast({
      type: 'success',
      title: 'Alineación guardada',
      message: `${newLineup.title} guardada con formación ${newLineup.formation}.`,
    });
  };

  const updateLineup = (updated: Lineup) => {
    setLineups((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    addToast({
      type: 'success',
      title: 'Once inicial actualizado',
    });
  };

  const deleteLineup = (lineupId: string) => {
    setLineups((prev) => prev.filter((l) => l.id !== lineupId));
    addToast({ type: 'info', title: 'Alineación eliminada' });
  };

  // TACTICAL PLAYS MUTATIONS
  const addTacticalPlay = (playData: Omit<TacticalPlay, 'id'>) => {
    const id = `tac-${Date.now()}`;
    const newPlay: TacticalPlay = { ...playData, id };
    setTacticalPlays((prev) => [newPlay, ...prev]);
    logAudit('Diseño de jugada ensayada', 'tactica', `Creada jugada ${newPlay.title} (${newPlay.phases.length} fases)`, id);
    addToast({
      type: 'success',
      title: 'Jugada ensayada guardada',
      message: `Pizarra táctica guardada con éxito en la biblioteca.`,
    });
  };

  const updateTacticalPlay = (updated: TacticalPlay) => {
    setTacticalPlays((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addToast({
      type: 'success',
      title: 'Pizarra táctica actualizada',
      message: `Cambios guardados en ${updated.title}.`,
    });
  };

  const deleteTacticalPlay = (playId: string) => {
    setTacticalPlays((prev) => prev.filter((t) => t.id !== playId));
    addToast({ type: 'info', title: 'Jugada ensayada eliminada' });
  };

  // GOOGLE SHEETS SYNC
  const updateSheetsConfig = (cfg: Partial<GoogleSheetsSyncConfig>) => {
    setSheetsConfigState((prev) => ({ ...prev, ...cfg }));
  };

  const syncWithSheets = async (): Promise<void> => {
    // Simulate real two-way synchronization handshake
    updateSheetsConfig({
      lastSync: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sheets: [
        { name: '1. Jugadores', rowsCount: players.length, status: 'synced' },
        { name: '2. Posiciones', rowsCount: 15, status: 'synced' },
        { name: '3. Clubes', rowsCount: clubs.length, status: 'synced' },
        { name: '4. Observaciones', rowsCount: observations.length, status: 'synced' },
        { name: '5. Agenda', rowsCount: events.length, status: 'synced' },
        { name: '6. Convocatorias', rowsCount: convocatorias.length, status: 'synced' },
        { name: '7. Jugadores por Convocatoria', rowsCount: convocatorias.reduce((acc, c) => acc + c.players.length, 0), status: 'synced' },
        { name: '8. Valoraciones Históricas', rowsCount: players.reduce((acc, p) => acc + (p.ratingsHistory?.length || 0), 0), status: 'synced' },
        { name: '9. Estadísticas', rowsCount: 12, status: 'synced' },
        { name: '10. Configuración', rowsCount: 8, status: 'synced' },
      ],
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          operation: 'EXPORT',
          status: 'success',
          details: `Sincronización completa con Google Sheets. Exportados ${players.length} futbolistas, ${observations.length} observaciones y ${convocatorias.length} convocatorias.`,
          recordsAffected: players.length + observations.length + convocatorias.length,
        },
        ...sheetsConfig.logs,
      ],
    });

    logAudit('Sincronización con Google Sheets', 'sincronizacion', `Sincronizadas 10 hojas con Google Sheets ID: ${sheetsConfig.sheetId}`);
    addToast({
      type: 'success',
      title: 'Sincronizado con Google Sheets',
      message: `Exportados ${players.length} futbolistas y registros vinculados a la hoja oficial.`,
    });
  };

  const importFromSheets = (importedPlayers: Partial<Player>[]): { added: number; updated: number; errors: string[] } => {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    setPlayers((prev) => {
      const copy = [...prev];
      importedPlayers.forEach((item, idx) => {
        if (!item.name || !item.surname) {
          errors.push(`Fila ${idx + 1}: Nombre o apellido vacío.`);
          return;
        }

        // Check if exists by internalCode or exact name + surname + birthDate
        const existingIndex = copy.findIndex(
          (p) =>
            (item.internalCode && p.internalCode === item.internalCode) ||
            (p.name.toLowerCase() === item.name?.toLowerCase() &&
              p.surname.toLowerCase() === item.surname?.toLowerCase() &&
              p.birthDate === item.birthDate)
        );

        if (existingIndex >= 0) {
          // Update
          copy[existingIndex] = {
            ...copy[existingIndex],
            ...item,
            calculatedAge: calculateAge(item.birthDate || copy[existingIndex].birthDate),
          } as Player;
          updated++;
        } else {
          // Add
          const id = `ply-${Date.now()}-${idx}`;
          const birthDate = item.birthDate || '2010-01-01';
          const calculatedAge = calculateAge(birthDate);
          const newPlayer: Player = {
            id,
            internalCode: item.internalCode || `CAN-${new Date().getFullYear()}-${String(copy.length + 1).padStart(3, '0')}`,
            name: item.name,
            surname: item.surname,
            sportName: item.sportName || `${item.name} ${item.surname[0]}.`,
            photoUrl: item.photoUrl || '',
            birthDate,
            calculatedAge,
            category: item.category || 'Sub-16',
            gender: item.gender || 'Masculino',
            clubId: item.clubId || 'club-udlp',
            clubName: item.clubName || 'UD Las Palmas',
            previousClubs: item.previousClubs || [],
            island: item.island || 'Gran Canaria',
            municipality: item.municipality || 'Las Palmas de Gran Canaria',
            competition: item.competition || 'Cadete Autonómica',
            division: item.division || 'Grupo 1',
            squadNumber: item.squadNumber || 10,
            dominantFoot: item.dominantFoot || 'Derecho',
            heightCm: item.heightCm || 172,
            nationality: item.nationality || 'Española (Canarias)',
            dateAdded: new Date().toISOString().split('T')[0],
            scoutLead: currentUser.name,
            status: item.status || 'nuevo',
            primaryPosition: item.primaryPosition || 'MC',
            secondaryPositions: item.secondaryPositions || [],
            tacticalProfile: item.tacticalProfile || 'Jugador polivalente',
            preferredSystems: item.preferredSystems || ['4-3-3'],
            ratings: item.ratings || {
              control: 7,
              shortPass: 7,
              longPass: 7,
              dribble: 7,
              crossing: 6,
              finishing: 6,
              heading: 6,
              shooting: 6,
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
            convocatoriasCount: 0,
            observationsCount: 0,
          };
          copy.push(newPlayer);
          added++;
        }
      });
      return copy;
    });

    logAudit('Importación masiva', 'sincronizacion', `Importación procesada: ${added} nuevos, ${updated} actualizados, ${errors.length} incidencias`);
    addToast({
      type: errors.length > 0 ? 'info' : 'success',
      title: 'Importación completada',
      message: `${added} jugadores añadidos, ${updated} actualizados. ${errors.length ? `(${errors.length} descartados)` : ''}`,
    });

    return { added, updated, errors };
  };

  const resetAllData = () => {
    localStorage.clear();
    setPlayers(INITIAL_PLAYERS);
    setObservations(INITIAL_OBSERVATIONS);
    setEvents(INITIAL_EVENTS);
    setConvocatorias(INITIAL_CONVOCATORIAS);
    setLineups(INITIAL_LINEUPS);
    setTacticalPlays(INITIAL_TACTICAL_PLAYS);
    setSheetsConfigState(INITIAL_SHEETS_CONFIG);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserState(INITIAL_USERS[0]);
    addToast({
      type: 'info',
      title: 'Datos restablecidos',
      message: 'Se han restaurado los datos y configuraciones iniciales de las Selecciones Canarias.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        theme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        sidebarHidden,
        setSidebarHidden,
        sidebarMode,
        setSidebarMode,
        toggleSidebarMode,
        mobileMenuOpen,
        setMobileMenuOpen,
        toggleMobileMenu,
        currentUser,
        setCurrentUser,
        users,
        canEdit,
        canManageUsers,
        canViewRestrictedData,
        players,
        clubs,
        observations,
        events,
        convocatorias,
        lineups,
        tacticalPlays,
        sheetsConfig,
        auditLogs,
        addPlayer,
        updatePlayer,
        deletePlayer,
        toggleFavoritePlayer,
        addObservation,
        deleteObservation,
        addEvent,
        updateEvent,
        deleteEvent,
        addConvocatoria,
        updateConvocatoria,
        deleteConvocatoria,
        addLineup,
        updateLineup,
        deleteLineup,
        addTacticalPlay,
        updateTacticalPlay,
        deleteTacticalPlay,
        syncWithSheets,
        importFromSheets,
        updateSheetsConfig,
        selectedPlayer,
        setSelectedPlayer,
        observationModalPlayer,
        setObservationModalPlayer,
        isCreatePlayerOpen,
        setIsCreatePlayerOpen,
        editingPlayer,
        setEditingPlayer,
        toasts,
        addToast,
        removeToast,
        resetAllData,
      }}
    >
      <div className={theme === 'dark' ? 'dark text-slate-100' : 'text-slate-900 bg-slate-50'}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
