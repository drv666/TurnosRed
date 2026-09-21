import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import { TurnosService } from '../src/services/turnos.service.js';

test('CRUD de especialidades en memoria y validaciones HTTP', async () => {
  const server = crearApp(
    new TurnosService('archivo-no-utilizado.json'),
  ).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await fetch(
      `http://127.0.0.1:${address.port}/especialidades`,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      { id: 1, nombre: 'Clínica médica' },
      { id: 2, nombre: 'Pediatría' },
      { id: 3, nombre: 'Odontología' },
      { id: 4, nombre: 'Nutrición' },
    ]);
    const base = `http://127.0.0.1:${address.port}/especialidades`;
    const post = (body: unknown) =>
      fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    for (const body of [{}, { nombre: 123 }, { nombre: '   ' }]) {
      const invalid = await post(body);
      assert.equal(invalid.status, 400);
      assert.equal((await invalid.json()).details[0].field, 'nombre');
    }
    const created = await post({ nombre: ' Cardiología ' });
    assert.equal(created.status, 201);
    const newItem = await created.json();
    assert.deepEqual(newItem, { id: 5, nombre: 'Cardiología' });
    const recovered = await fetch(base + '/5');
    assert.deepEqual(await recovered.json(), newItem);
    const duplicate = await post({ nombre: 'cardiología' });
    assert.equal(duplicate.status, 400);
    assert.equal((await duplicate.json()).code, 'DUPLICATE_SPECIALTY');
    const put = (id: string, body: unknown) =>
      fetch(base + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    const updated = await put('5', { nombre: ' Cardiología infantil ' });
    assert.equal(updated.status, 200);
    assert.deepEqual(await updated.json(), {
      id: 5,
      nombre: 'Cardiología infantil',
    });
    assert.equal((await put('abc', { nombre: 'Prueba' })).status, 400);
    assert.equal((await put('999', { nombre: 'Prueba' })).status, 404);
    assert.equal((await put('5', { nombre: 123 })).status, 400);
    assert.equal((await put('5', {})).status, 400);
    assert.equal((await put('5', { nombre: 'Pediatría' })).status, 400);
    assert.deepEqual(await (await fetch(base + '/5')).json(), {
      id: 5,
      nombre: 'Cardiología infantil',
    });
    const found = await fetch(base + '/2');
    const removed = await fetch(base + '/5', { method: 'DELETE' });
    assert.equal(removed.status, 204);
    assert.equal(await removed.text(), '');
    assert.equal((await fetch(base + '/5')).status, 404);
    assert.equal((await fetch(base + '/5', { method: 'DELETE' })).status, 404);
    assert.equal(
      (await fetch(base + '/abc', { method: 'DELETE' })).status,
      400,
    );
    assert.equal(found.status, 200);
    assert.deepEqual(await found.json(), { id: 2, nombre: 'Pediatría' });
    const missing = await fetch(base + '/999');
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).message, 'Especialidad no encontrada');
    for (const id of ['abc', '0', '-1', '1.5', '9007199254740992']) {
      const invalid = await fetch(base + '/' + id);
      assert.equal(invalid.status, 400);
      const body = await invalid.json();
      assert.equal(body.code, 'VALIDATION_ERROR');
      assert.equal(body.details[0].field, 'id');
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
