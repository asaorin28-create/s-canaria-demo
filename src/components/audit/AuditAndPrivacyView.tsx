import React from 'react';
import { useApp } from '../../context/AppContext';
import { downloadJSONBackup } from '../../utils/exportUtils';
import {
  Lock,
  Shield,
  FileCheck,
  Download,
  RotateCcw,
  Users,
  Eye,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const AuditAndPrivacyView: React.FC = () => {
  const { auditLogs, currentUser, players, observations, convocatorias, lineups, resetAllData } = useApp();

  const handleDownloadFullBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      platform: 'ScoutCanarias — Selecciones Canarias de Fútbol',
      players,
      observations,
      convocatorias,
      lineups,
      auditLogs,
    };
    downloadJSONBackup(backupData, `copia_seguridad_scoutcanarias_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Privacidad RGPD, Roles & Trazabilidad de Auditoría</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Garantías de protección para futbolistas menores de edad y registro de actividad
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFullBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Copia de Seguridad (JSON)</span>
          </button>
          <button
            onClick={() => {
              if (confirm('¿Restablecer todos los datos a la configuración inicial federativa?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos Iniciales</span>
          </button>
        </div>
      </div>

      {/* RGPD Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Shield className="w-4 h-4" />
            <span>Protección de Menores de Edad</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Se recogen únicamente datos estrictamente deportivos. Los datos de contacto familiares (teléfono y correo) permanecen encriptados y restringidos exclusivamente a Administradores y Coordinadores federativos.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <FileCheck className="w-4 h-4" />
            <span>Consentimiento Expreso de Tutores</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cada expediente dispone de una verificación de autorización de representación y cesión de imagen firmada por progenitores o tutores legales antes de su inclusión en convocatorias oficiales.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <Lock className="w-4 h-4" />
            <span>Principio de Minimización</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            No se almacenan historiales médicos invasivos ni datos sensibles. Las valoraciones técnicas conservan trazabilidad inmutable sin sobrescritura opaca de informes anteriores.
          </p>
        </div>
      </div>

      {/* Role & Permissions Matrix */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          Matriz de Roles y Permisos de la Plataforma
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3 text-center">Censo & Fichas</th>
                <th className="py-2.5 px-3 text-center">Observaciones</th>
                <th className="py-2.5 px-3 text-center">Convocatorias</th>
                <th className="py-2.5 px-3 text-center">Pizarra Táctica</th>
                <th className="py-2.5 px-3 text-center">Google Sheets</th>
                <th className="py-2.5 px-3 text-center">Datos Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {[
                { role: 'Administrador', censo: 'Total', obs: 'Total', conv: 'Total', tac: 'Total', sheets: 'Total', priv: 'Total' },
                { role: 'Coordinador Deportivo', censo: 'Total', obs: 'Total', conv: 'Total', tac: 'Total', sheets: 'Total', priv: 'Total' },
                { role: 'Seleccionador Insular', censo: 'Edición', obs: 'Total', conv: 'Total', tac: 'Total', sheets: 'Lectura', priv: 'Restringido' },
                { role: 'Scout / Ojeador', censo: 'Lectura', obs: 'Creación', conv: 'Lectura', tac: 'Lectura', sheets: 'Lectura', priv: 'Oculto' },
                { role: 'Entrenador de Club', censo: 'Lectura', obs: 'Lectura', conv: 'Consulta', tac: 'Creación', sheets: 'Oculto', priv: 'Oculto' },
                { role: 'Consulta / Auditor', censo: 'Lectura', obs: 'Lectura', conv: 'Lectura', tac: 'Lectura', sheets: 'Lectura', priv: 'Oculto' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{r.role}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.censo}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.obs}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.conv}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.tac}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.sheets}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-amber-400 font-bold">{r.priv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Trail */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Registro de Auditoría de Operaciones (Audit Trail)</span>
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{log.action}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-700 text-amber-300 font-mono text-[10px] uppercase">
                    {log.entityType}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-slate-400 text-[11px] block">{log.timestamp}</span>
                <span className="text-slate-500 text-[10px]">Por: {log.userName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
