import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import { TurnosService } from '../src/services/turnos.service.js';
import { DoctorService } from '../src/services/doctor.service.js';

test('CRUD de médicos, persistencia y relación con turnos', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'api2-doctors-'));
  const file = path.join(dir, 'turnos.json');
  const doctorFile = path.join(dir, 'medicos.json');
  await writeFile(file, '[]');
  const doctors: DoctorService = new DoctorService(doctorFile, (id) =>
    service.obtenerTodos().some((t) => t.medicoId === id),
  );
  const service: TurnosService = new TurnosService(file, doctors);
  await doctors.load();
  await service.cargar();
  const server = crearApp(service, doctors).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const request = (route: string, method = 'GET', body?: unknown) =>
    fetch(`http://127.0.0.1:${address.port}${route}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  const doctor = {
    id: 1,
    nombre: 'Médica de prueba',
    documento: '23456789',
    especialidad: 'Nutrición',
    disponible: true,
  };
  const turno = {
    id: 104,
    medicoId: 1,
    paciente: 'Paciente de prueba',
    documento: '12345678',
    especialidad: 'Nutrición',
    fecha: '2026-09-20',
    hora: '10:30',
    confirmado: true,
  };
  try {
    assert.equal(
      (await request('/medicos', 'POST', { ...doctor, documento: 123 })).status,
      400,
    );
    assert.equal((await request('/medicos/999')).status, 404);
    assert.equal((await request('/medicos/abc')).status, 400);
    assert.equal((await request('/medicos', 'POST', doctor)).status, 201);
    assert.equal((await request('/medicos', 'POST', doctor)).status, 400);
    assert.deepEqual(await (await request('/medicos')).json(), [doctor]);
    const inactive = { ...doctor, id: 2, disponible: false };
    const pediatrician = { ...doctor, id: 3, especialidad: 'Pediatría' };
    assert.equal((await request('/medicos', 'POST', inactive)).status, 201);
    assert.equal((await request('/medicos', 'POST', pediatrician)).status, 201);
    const nutrition = encodeURIComponent('Nutrición');
    assert.deepEqual(
      await (await request('/medicos?disponible=false')).json(),
      [inactive],
    );
    assert.deepEqual(
      await (
        await request(`/medicos?especialidad=${nutrition}&disponible=true`)
      ).json(),
      [doctor],
    );
    assert.deepEqual(
      await (await request(`/medicos?especialidad=${nutrition}`)).json(),
      [doctor, inactive],
    );
    for (const query of [
      'disponible=no',
      'disponible=true&disponible=false',
      'especialidad=otra',
    ]) {
      const response = await request(`/medicos?${query}`);
      assert.equal(response.status, 400);
      assert.equal((await response.json()).code, 'VALIDATION_ERROR');
    }
    assert.equal((await request('/medicos/2', 'DELETE')).status, 204);
    assert.equal((await request('/medicos/3', 'DELETE')).status, 204);
    const reloaded = new DoctorService(doctorFile);
    await reloaded.load();
    assert.deepEqual(reloaded.get(1), doctor);
    assert.equal(
      (await request('/turnos', 'POST', { ...turno, medicoId: 999 })).status,
      404,
    );
    assert.equal(
      (
        await request('/turnos', 'POST', {
          ...turno,
          especialidad: 'Pediatría',
        })
      ).status,
      400,
    );
    assert.equal(
      (await request('/medicos/1', 'PUT', { ...doctor, disponible: false }))
        .status,
      200,
    );
    assert.equal((await request('/turnos', 'POST', turno)).status, 400);
    assert.equal((await request('/medicos/1', 'PUT', doctor)).status, 200);
    assert.equal((await request('/turnos', 'POST', turno)).status, 201);
    assert.equal((await (await request('/turnos/104')).json()).medicoId, 1);
    const secondTurno = { ...turno, id: 105, fecha: '2026-09-21' };
    assert.equal((await request('/turnos', 'POST', secondTurno)).status, 201);
    for (const query of [`especialidad=${nutrition}`, 'medicoId=1']) {
      assert.equal(
        (await (await request(`/turnos?${query}`)).json()).length,
        2,
      );
    }
    const filtered = await request(
      `/turnos?especialidad=${nutrition}&fecha=2026-09-20&medicoId=1`,
    );
    assert.equal(filtered.status, 200);
    assert.deepEqual(
      (await filtered.json()).map((t: { id: number }) => t.id),
      [104],
    );
    assert.deepEqual(await (await request('/turnos?medicoId=999')).json(), []);
    assert.deepEqual(
      await (await request('/turnos?fecha=2026-09-22')).json(),
      [],
    );
    for (const query of [
      'fecha=2026-02-30',
      'medicoId=0',
      'medicoId=abc',
      'medicoId=1&medicoId=2',
    ]) {
      assert.equal((await request(`/turnos?${query}`)).status, 400);
    }
    assert.equal((await request('/turnos/105', 'DELETE')).status, 204);
    assert.equal((await request('/medicos/1', 'DELETE')).status, 400);
    assert.equal(
      (
        await request('/medicos/1', 'PUT', {
          ...doctor,
          especialidad: 'Pediatría',
        })
      ).status,
      400,
    );
    assert.equal((await request('/turnos/104', 'DELETE')).status, 204);
    const deleted = await request('/medicos/1', 'DELETE');
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), '');
    assert.equal((await request('/medicos/1')).status, 404);
    await reloaded.load();
    assert.deepEqual(reloaded.list(), []);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
    await rm(dir, { recursive: true });
  }
});
