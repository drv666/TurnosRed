import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import { TurnosService } from '../src/services/turnos.service.js';

test('bienvenida y rutas inexistentes desde el controlador general', async () => {
  const app = crearApp(new TurnosService('archivo-no-utilizado.json'));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const welcome = await fetch(base + '/');
    assert.equal(welcome.status, 200);
    assert.match((await welcome.json()).message, /Hello World/);
    for (const method of ['GET', 'POST']) {
      const missing = await fetch(base + '/ruta-inexistente', { method });
      assert.equal(missing.status, 404);
      assert.deepEqual(await missing.json(), {
        status: 404,
        message: 'Ruta no encontrada',
        code: 'NOT_FOUND',
        details: [],
      });
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
