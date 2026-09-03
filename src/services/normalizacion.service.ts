import type { Turno, TurnoCrudo } from '../models/turno.js';

const texto = (valor: unknown): string =>
  typeof valor === 'string' || typeof valor === 'number'
    ? String(valor).trim()
    : '';

const normalizarFecha = (valor: unknown): string => {
  const fecha = texto(valor);
  const partes = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : fecha;
};

const normalizarHora = (valor: unknown): string => {
  const hora = texto(valor).replace('.', ':');
  return /^\d{1}:\d{2}$/.test(hora) ? `0${hora}` : hora;
};

const normalizarBooleano = (valor: unknown): boolean | undefined => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number' && (valor === 0 || valor === 1))
    return valor === 1;
  if (typeof valor !== 'string') return undefined;
  const limpio = valor.trim().toLowerCase();
  if (['si', 'sí', 'true', '1'].includes(limpio)) return true;
  if (['no', 'false', '0'].includes(limpio)) return false;
  return undefined;
};

export const normalizarTurno = (crudo: TurnoCrudo): Turno | null => {
  const id = Number(crudo.id);
  const paciente = texto(crudo.paciente).replace(/\s+/g, ' ');
  const documento = texto(crudo.documento);
  const especialidadOriginal = texto(crudo.especialidad);
  const fecha = normalizarFecha(crudo.fecha);
  const hora = normalizarHora(crudo.hora);
  const confirmado = normalizarBooleano(crudo.confirmado);
  const valido =
    Number.isInteger(id) &&
    id > 0 &&
    paciente.length > 0 &&
    documento.length > 0 &&
    especialidadOriginal.length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(hora) &&
    confirmado !== undefined;
  if (!valido) return null;
  const especialidad =
    especialidadOriginal.charAt(0).toLocaleUpperCase('es') +
    especialidadOriginal.slice(1).toLocaleLowerCase('es');
  const observaciones = texto(crudo.observaciones);
  return {
    id,
    paciente,
    documento,
    especialidad,
    fecha,
    hora,
    confirmado,
    ...(observaciones ? { observaciones } : {}),
  };
};
