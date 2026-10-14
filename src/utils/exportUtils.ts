import { Player, PlayerRatings, ScoutingStatus } from '../types';

export function calculateOverallRating(ratings: PlayerRatings): number {
  if (!ratings) return 0;
  const techVals = [
    ratings.control,
    ratings.shortPass,
    ratings.longPass,
    ratings.dribble,
    ratings.crossing,
    ratings.finishing,
    ratings.heading,
    ratings.shooting,
    ratings.recovery,
    ratings.anticipation,
    ratings.vision,
    ratings.positioning,
  ];
  const physVals = [
    ratings.speed,
    ratings.acceleration,
    ratings.stamina,
    ratings.strength,
    ratings.agility,
    ratings.coordination,
    ratings.jumping,
  ];
  const tactVals = [
    ratings.tacticalUnderstanding,
    ratings.tacticalDiscipline,
    ratings.spaceOccupation,
    ratings.pressing,
    ratings.defTransition,
    ratings.offTransition,
    ratings.offTheBall,
    ratings.systemAdaptability,
  ];
  const mentVals = [
    ratings.leadership,
    ratings.focus,
    ratings.competitiveness,
    ratings.communication,
    ratings.teamwork,
  ];

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const techAvg = avg(techVals);
  const physAvg = avg(physVals);
  const tactAvg = avg(tactVals);
  const mentAvg = avg(mentVals);

  // Standard weighted distribution: Technical 35%, Tactical 30%, Physical 20%, Mental 15%
  const composite = techAvg * 0.35 + tactAvg * 0.3 + physAvg * 0.2 + mentAvg * 0.15;
  return Number(composite.toFixed(1));
}

export function getStatusInfo(status: ScoutingStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'prioritario':
      return { label: 'Prioritario', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'convocado':
      return { label: 'Convocado', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'propuesto_convocatoria':
      return { label: 'Propuesto', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'en_seguimiento':
      return { label: 'En Seguimiento', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'observado_1':
      return { label: 'Observado (1ª)', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    case 'pendiente_observar':
      return { label: 'Pendiente', bg: 'bg-amber-700/15', text: 'text-amber-300', border: 'border-amber-600/30' };
    case 'nuevo':
      return { label: 'Nuevo', bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' };
    case 'evaluacion_adicional':
      return { label: 'En Evaluación', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'no_prioritario':
      return { label: 'No prioritario', bg: 'bg-zinc-600/15', text: 'text-zinc-400', border: 'border-zinc-600/30' };
    case 'archivado':
      return { label: 'Archivado', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' };
    default:
      return { label: status, bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' };
  }
}

export function exportPlayersToCSV(players: Player[]) {
  const headers = [
    'Código Interno',
    'Nombre',
    'Apellidos',
    'Nombre Deportivo',
    'Fecha Nacimiento',
    'Edad',
    'Categoría',
    'Género',
    'Club Actual',
    'Isla',
    'Municipio',
    'Posición Principal',
    'Posiciones Secundarias',
    'Pie Dominante',
    'Altura (cm)',
    'Valoración Técnica',
    'Estado Seguimiento',
    'Scout Responsable',
    'Fecha Alta',
  ];

  const rows = players.map((p) => {
    const secPos = p.secondaryPositions?.map((s) => s.position).join(';') || '';
    const rating = calculateOverallRating(p.ratings);
    return [
      p.internalCode,
      `"${p.name}"`,
      `"${p.surname}"`,
      `"${p.sportName}"`,
      p.birthDate,
      p.calculatedAge,
      p.category,
      p.gender,
      `"${p.clubName}"`,
      p.island,
      `"${p.municipality}"`,
      p.primaryPosition,
      `"${secPos}"`,
      p.dominantFoot,
      p.heightCm,
      rating,
      p.status,
      `"${p.scoutLead}"`,
      p.dateAdded,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `scoutcanarias_censo_jugadores_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSONBackup(data: unknown, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
