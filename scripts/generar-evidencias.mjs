import { writeFile } from 'node:fs/promises';

const baseUrl = 'http://localhost:3000/turnos';
const nuevo = {
  id: 104,
  paciente: 'María López',
  documento: '30111222',
  especialidad: 'Nutrición',
  fecha: '2026-08-20',
  hora: '09:00',
  confirmado: true,
};
const actualizado = { ...nuevo, fecha: '2026-08-21', hora: '10:15', observaciones: 'Control' };

const ejecutar = async (nombre, metodo, url, body) => {
  const inicio = performance.now();
  const respuesta = await fetch(url, {
    method: metodo,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const datos = await respuesta.json();
  return { nombre, metodo, url, estado: respuesta.status, duracionMs: Math.round(performance.now() - inicio), datos };
};

try { await fetch(`${baseUrl}/104`, { method: 'DELETE' }); } catch {}
const resultados = [];
resultados.push(await ejecutar('Obtener todos', 'GET', baseUrl));
resultados.push(await ejecutar('Obtener por ID', 'GET', `${baseUrl}/102`));
resultados.push(await ejecutar('Crear turno', 'POST', baseUrl, nuevo));
resultados.push(await ejecutar('Actualizar turno', 'PUT', `${baseUrl}/104`, actualizado));
resultados.push(await ejecutar('Eliminar turno', 'DELETE', `${baseUrl}/104`));

await writeFile(
  './evidencias/resultados-api.json',
  `${JSON.stringify({ fecha: new Date().toISOString(), aprobadas: resultados.every((r) => r.estado >= 200 && r.estado < 300), resultados }, null, 2)}\n`,
);
console.table(resultados.map(({ nombre, metodo, estado, duracionMs }) => ({ nombre, metodo, estado, duracionMs })));
