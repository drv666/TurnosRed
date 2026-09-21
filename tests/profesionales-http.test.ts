import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import { TurnosService } from '../src/services/turnos.service.js';

test('Profesionales: consultas, creación, actualización, eliminación y validaciones', async () => {
  const server = crearApp(
    new TurnosService('archivo-no-utilizado.json'),
  ).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await fetch(
      `http://127.0.0.1:${address.port}/profesionales`,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      {
        id: 1,
        nombre: 'Profesional de prueba',
        matricula: 'DEMO-001',
        especialidadId: 2,
      },
    ]);
    const base = `http://127.0.0.1:${address.port}/profesionales`;
    const post = (body: unknown) =>
      fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    const valid = {
      nombre: 'Profesional nuevo de prueba',
      matricula: 'DEMO-002',
      especialidadId: 2,
    };
    for (const body of [
      {},
      { ...valid, matricula: 123 },
      { ...valid, especialidadId: '2' },
      { ...valid, especialidadId: 999 },
    ]) {
      assert.equal((await post(body)).status, 400);
    }
    const created = await post(valid);
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), { id: 2, ...valid });
    assert.deepEqual(await (await fetch(base + '/2')).json(), {
      id: 2,
      ...valid,
    });
    assert.equal((await post(valid)).status, 400);
    const put = (id: string, body: unknown) =>
      fetch(base + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    const actualizado = {
      ...valid,
      nombre: 'Nombre actualizado',
      especialidadId: 3,
    };
    const updated = await put('2', actualizado);
    assert.equal(updated.status, 200);
    assert.deepEqual(await updated.json(), { id: 2, ...actualizado });
    assert.equal((await put('999', valid)).status, 404);
    assert.equal((await put('abc', valid)).status, 400);
    for (const body of [
      {},
      { ...valid, matricula: 'DEMO-001' },
      { ...valid, especialidadId: 999 },
      { ...valid, especialidadId: '2' },
    ]) {
      assert.equal((await put('2', body)).status, 400);
      assert.deepEqual(await (await fetch(base + '/2')).json(), {
        id: 2,
        ...actualizado,
      });
    }
    for (const id of ['abc', '0', '-1', '1.5']) {
      assert.equal(
        (await fetch(base + '/' + id, { method: 'DELETE' })).status,
        400,
      );
    }
    assert.deepEqual(await (await fetch(base + '/2')).json(), {
      id: 2,
      ...actualizado,
    });
    const deleted = await fetch(base + '/2', { method: 'DELETE' });
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), '');
    assert.equal((await fetch(base + '/2')).status, 404);
    assert.equal((await fetch(base + '/2', { method: 'DELETE' })).status, 404);
    const found = await fetch(base + '/1');
    assert.equal(found.status, 200);
    assert.deepEqual(await found.json(), {
      id: 1,
      nombre: 'Profesional de prueba',
      matricula: 'DEMO-001',
      especialidadId: 2,
    });
    const missing = await fetch(base + '/999');
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).message, 'Profesional no encontrado');
    for (const id of ['abc', '0', '-1', '1.5', '9007199254740992']) {
      const invalid = await fetch(base + '/' + id);
      assert.equal(invalid.status, 400);
      assert.equal((await invalid.json()).details[0].field, 'id');
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
