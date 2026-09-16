import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import { TurnosService } from '../src/services/turnos.service.js';

test('validación HTTP, errores uniformes y CRUD sin modificar los datos del proyecto', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'api2-validation-'));
  const file = path.join(dir, 'turnos.json');
  await writeFile(file, '[]');
  const service = new TurnosService(file);
  await service.cargar();
  const server = crearApp(service).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const valid = {
    medicoId: 1,
    id: 104,
    paciente: 'Paciente de prueba',
    documento: '12345678',
    especialidad: 'Nutrición',
    fecha: '2026-09-20',
    hora: '10:30',
    confirmado: true,
  };
  const request = (route: string, method = 'GET', body?: unknown) =>
    fetch(base + route, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  const checkError = async (
    response: Response,
    status: number,
    code: string,
  ) => {
    assert.equal(response.status, status);
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), [
      'code',
      'details',
      'message',
      'status',
    ]);
    assert.equal(body.code, code);
    assert.equal(body.status, status);
    return body;
  };
  try {
    const bad = await checkError(
      await request('/turnos', 'POST', { ...valid, documento: 12345678 }),
      400,
      'VALIDATION_ERROR',
    );
    assert.equal(bad.details[0].field, 'documento');
    await checkError(await request('/turnos', 'POST'), 400, 'VALIDATION_ERROR');
    await checkError(
      await fetch(base + '/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      }),
      400,
      'INVALID_JSON',
    );
    assert.deepEqual(await (await request('/turnos')).json(), []);
    await checkError(await request('/turnos/999'), 404, 'NOT_FOUND');
    await checkError(await request('/missing'), 404, 'NOT_FOUND');
    await checkError(await request('/turnos/abc'), 400, 'VALIDATION_ERROR');
    assert.equal((await request('/turnos', 'POST', valid)).status, 201);
    await checkError(
      await request('/turnos', 'POST', valid),
      400,
      'VALIDATION_ERROR',
    );
    await checkError(
      await request('/turnos/104', 'PUT', { ...valid, documento: 123 }),
      400,
      'VALIDATION_ERROR',
    );
    assert.equal(
      (await (await request('/turnos/104')).json()).documento,
      '12345678',
    );
    await checkError(
      await request('/turnos/104', 'PUT', { ...valid, id: 105 }),
      400,
      'VALIDATION_ERROR',
    );
    const updated = await request('/turnos/104', 'PUT', {
      ...valid,
      hora: '11:00',
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).hora, '11:00');
    const deleted = await request('/turnos/104', 'DELETE');
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), '');
    await checkError(await request('/turnos/104'), 404, 'NOT_FOUND');
    service.obtenerTodos = () => {
      throw new Error('Fallo simulado para verificar 500');
    };
    const internal = await checkError(
      await request('/turnos'),
      500,
      'INTERNAL_ERROR',
    );
    assert.equal(internal.message, 'Error interno del servidor');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(dir, { recursive: true });
  }
});
