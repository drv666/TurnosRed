export interface TurnoCrudo {
  medicoId?: unknown;
  id?: unknown;
  paciente?: unknown;
  documento?: unknown;
  especialidad?: unknown;
  fecha?: unknown;
  hora?: unknown;
  confirmado?: unknown;
  observaciones?: unknown;
}

export interface Turno {
  // Los registros históricos de API 1 pueden no tener un médico asignado.
  medicoId?: number;
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}
