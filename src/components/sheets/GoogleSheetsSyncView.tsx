import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportPlayersToCSV } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  RefreshCw,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Table,
  Database,
  History,
  FileCheck,
  Check,
} from 'lucide-react';

export const GoogleSheetsSyncView: React.FC = () => {
  const { sheetsConfig, syncWithSheets, importFromSheets, players, observations, convocatorias } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [importSummary, setImportSummary] = useState<{
    added: number;
    updated: number;
    errors: string[];
  } | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithSheets();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleProcessCsvImport = () => {
    if (!csvInput.trim()) return;

    try {
      const lines = csvInput.trim().split('\n');
      if (lines.length <= 1) return;

      const header = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const parsedItems = lines.slice(1).map((line) => {
        const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        return {
          internalCode: parts[0] || '',
          name: parts[1] || 'Jugador',
          surname: parts[2] || 'Canario',
          sportName: parts[3] || parts[1],
          birthDate: parts[4] || '2010-01-01',
          category: (parts[6] || 'Sub-16') as any,
          clubName: parts[8] || 'Club Canario',
          island: (parts[9] || 'Gran Canaria') as any,
          primaryPosition: (parts[11] || 'MC') as any,
          dominantFoot: (parts[13] || 'Derecho') as any,
          heightCm: Number(parts[14]) || 170,
        };
      });

      const res = importFromSheets(parsedItems);
      setImportSummary(res);
      setCsvInput('');
    } catch (err: any) {
      setImportSummary({
        added: 0,
        updated: 0,
        errors: [`Error al procesar el archivo CSV: ${err.message}`],
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Sincronización con Google Sheets</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Conectado
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta federativa, exportación e importación controlada con identificadores únicos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPlayersToCSV(players)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV Completo</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Libro Oficial: Selecciones_Canarias_Scouting_2026.xlsx
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ID: {sheetsConfig.sheetId} · Última sincronización: {sheetsConfig.lastSync || 'Hoy'}
            </p>
          </div>
        </div>

        <a
          href={sheetsConfig.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Abrir Google Sheets</span>
        </a>
      </div>

      {/* 10-Tab Schema Inspection Grid (Section 10.1) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Table className="w-4 h-4" />
          <span>Estructura de 10 Pestañas Oficiales en Google Sheets</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {sheetsConfig.sheets.map((sh, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1 hover:border-slate-600 transition-colors"
            >
              <div className="font-semibold text-white truncate">{sh.name}</div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-mono text-amber-400">{sh.rowsCount} filas</span>
                <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                  <Check className="w-3 h-3" />
                  OK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mass Import from Sheets / CSV */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Importación Masiva desde Google Sheets / CSV</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pega aquí el contenido copiado de la hoja de cálculo o archivo CSV. El sistema detectará automáticamente duplicados por código o nombre completo y actualizará los registros sin duplicar filas.
          </p>

          <textarea
            rows={5}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Código,Nombre,Apellidos,Nombre Deportivo,Fecha Nacimiento,Edad,Categoría,Género,Club Actual,Isla..."
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />

          <button
            onClick={handleProcessCsvImport}
            disabled={!csvInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <FileCheck className="w-4 h-4" />
            <span>Validar e Importar Datos</span>
          </button>

          {importSummary && (
            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1">
              <div className="font-semibold text-emerald-400">
                Resultado: {importSummary.added} futbolistas añadidos, {importSummary.updated} actualizados.
              </div>
              {importSummary.errors.length > 0 && (
                <div className="text-amber-400">
                  {importSummary.errors.map((err, i) => (
                    <p key={i}>· {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sync Logs */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Registro Histórico de Sincronizaciones</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {sheetsConfig.logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-mono text-[11px] text-amber-300">{log.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                    {log.operation}
                  </span>
                </div>
                <p className="text-slate-200">{log.details}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Registros procesados: {log.recordsAffected}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
