import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Captura respuestas reales con datos de prueba y construye ejemplos reproducibles.
const base = 'http://localhost:3002';
const mock = 'https://47320a5d-0b6d-44de-b5bb-9a45c5928fb9.mock.pstmn.io';
const id = Date.now();
const values = { baseUrl: base, mockUrl: mock, medicoId: id, turnoId: id + 1 };
const resolve = (text) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ''));
const specialty = {
  type: 'string',
  enum: ['Clínica médica', 'Pediatría', 'Odontología', 'Nutrición'],
};
const doctorSchema = {
  type: 'object',
  required: ['id', 'nombre', 'documento', 'especialidad', 'disponible'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer', minimum: 1 },
    nombre: { type: 'string', minLength: 1 },
    documento: { type: 'string', minLength: 1 },
    especialidad: specialty,
    disponible: { type: 'boolean' },
  },
};
const appointmentSchema = {
  type: 'object',
  required: [
    'id',
    'paciente',
    'documento',
    'especialidad',
    'fecha',
    'hora',
    'confirmado',
  ],
  additionalProperties: false,
  properties: {
    id: { type: 'integer', minimum: 1 },
    medicoId: { type: 'integer', minimum: 1 },
    paciente: { type: 'string', minLength: 1 },
    documento: { type: 'string', minLength: 1 },
    especialidad: specialty,
    fecha: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    hora: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
    confirmado: { type: 'boolean' },
    observaciones: { type: 'string' },
  },
};
const errorSchema = {
  type: 'object',
  required: ['status', 'message', 'code', 'details'],
  additionalProperties: false,
  properties: {
    status: { type: 'integer' },
    message: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'array', items: { type: 'object' } },
  },
};
const array = (schema) => ({ type: 'array', items: schema });
const doctor = {
  id: '{{medicoId}}',
  nombre: 'Médica de colección API 2',
  documento: '23456789',
  especialidad: 'Nutrición',
  disponible: true,
};
const appointment = {
  id: '{{turnoId}}',
  medicoId: '{{medicoId}}',
  paciente: 'Paciente de colección API 2',
  documento: '12345678',
  especialidad: 'Nutrición',
  fecha: '2026-09-20',
  hora: '10:30',
  confirmado: true,
};
const raw = (body) =>
  JSON.stringify(body, null, 2).replace(
    /"(\{\{(?:medicoId|turnoId)\}\})"/g,
    '$1',
  );
const schemaTest = (schema) =>
  `pm.test("Esquema JSON válido", () => { pm.response.to.have.jsonSchema(${JSON.stringify(schema)}); });`;
const idTest = (key, field = 'id') =>
  `pm.test("Identificador esperado", () => { pm.expect(pm.response.json().${field}).to.eql(Number(pm.environment.get("${key}"))); });`;
const nutrition = encodeURIComponent('Nutrición');
const cases = [
  {
    name: '01 Crear médico',
    method: 'POST',
    route: '/medicos',
    body: doctor,
    status: 201,
    schema: doctorSchema,
    extra: idTest('medicoId'),
    init: true,
  },
  {
    name: '02 Listar médicos',
    route: '/medicos',
    status: 200,
    schema: array(doctorSchema),
  },
  {
    name: '03 Consultar médico por ID',
    route: '/medicos/{{medicoId}}',
    status: 200,
    schema: doctorSchema,
    extra: idTest('medicoId'),
  },
  {
    name: '04 Actualizar médico',
    method: 'PUT',
    route: '/medicos/{{medicoId}}',
    body: { ...doctor, nombre: 'Médica actualizada API 2' },
    status: 200,
    schema: doctorSchema,
    extra:
      'pm.test("Nombre actualizado", () => { pm.expect(pm.response.json().nombre).to.eql("Médica actualizada API 2"); });',
  },
  {
    name: '05 Filtrar médicos',
    route: `/medicos?especialidad=${nutrition}&disponible=true`,
    status: 200,
    schema: array(doctorSchema),
    extra:
      'pm.test("Filtros y médico creado", () => { const data = pm.response.json(); pm.expect(data.some(d => d.id === Number(pm.environment.get("medicoId")))).to.eql(true); data.forEach(d => { pm.expect(d.especialidad).to.eql("Nutrición"); pm.expect(d.disponible).to.eql(true); }); });',
  },
  {
    name: '06 Médico inválido - documento numérico',
    method: 'POST',
    route: '/medicos',
    body: { ...doctor, documento: 23456789 },
    status: 400,
    error: 'VALIDATION_ERROR',
    field: 'documento',
  },
  {
    name: '07 Médico inexistente',
    route: '/medicos/9999999999999',
    status: 404,
    error: 'NOT_FOUND',
  },
  {
    name: '08 Crear turno asociado',
    method: 'POST',
    route: '/turnos',
    body: appointment,
    status: 201,
    schema: appointmentSchema,
    extra: idTest('turnoId') + '\n' + idTest('medicoId', 'medicoId'),
  },
  {
    name: '09 Listar turnos',
    route: '/turnos',
    status: 200,
    schema: array(appointmentSchema),
  },
  {
    name: '10 Consultar turno asociado',
    route: '/turnos/{{turnoId}}',
    status: 200,
    schema: appointmentSchema,
    extra: idTest('turnoId') + '\n' + idTest('medicoId', 'medicoId'),
  },
  {
    name: '11 Actualizar turno',
    method: 'PUT',
    route: '/turnos/{{turnoId}}',
    body: { ...appointment, hora: '11:30' },
    status: 200,
    schema: appointmentSchema,
    extra:
      'pm.test("Horario actualizado", () => { pm.expect(pm.response.json().hora).to.eql("11:30"); });',
  },
  {
    name: '12 Filtrar turnos por tres criterios',
    route: `/turnos?especialidad=${nutrition}&fecha=2026-09-20&medicoId={{medicoId}}`,
    status: 200,
    schema: array(appointmentSchema),
    extra:
      'pm.test("Coinciden los tres filtros", () => { const data = pm.response.json(); pm.expect(data).to.have.lengthOf(1); pm.expect(data[0].medicoId).to.eql(Number(pm.environment.get("medicoId"))); pm.expect(data[0].especialidad).to.eql("Nutrición"); pm.expect(data[0].fecha).to.eql("2026-09-20"); });',
  },
  {
    name: '13 Turno inválido - documento numérico',
    method: 'POST',
    route: '/turnos',
    body: { ...appointment, documento: 12345678 },
    status: 400,
    error: 'VALIDATION_ERROR',
    field: 'documento',
  },
  {
    name: '14 Turno inexistente',
    route: '/turnos/9999999999999',
    status: 404,
    error: 'NOT_FOUND',
  },
  {
    name: '15 Query inválida',
    route: '/medicos?disponible=quizas',
    status: 400,
    error: 'VALIDATION_ERROR',
    field: 'disponible',
  },
  {
    name: '16 Sin coincidencias',
    route: '/turnos?medicoId=9999999999999',
    status: 200,
    schema: array(appointmentSchema),
    extra:
      'pm.test("Lista vacía", () => { pm.expect(pm.response.json()).to.eql([]); });',
  },
  {
    name: '17 Impedir eliminar médico con turnos',
    method: 'DELETE',
    route: '/medicos/{{medicoId}}',
    status: 400,
    error: 'DOCTOR_HAS_APPOINTMENTS',
  },
  {
    name: '18 Eliminar turno de prueba',
    method: 'DELETE',
    route: '/turnos/{{turnoId}}',
    status: 204,
  },
  {
    name: '19 Verificar turno eliminado',
    route: '/turnos/{{turnoId}}',
    status: 404,
    error: 'NOT_FOUND',
  },
  {
    name: '20 Eliminar médico de prueba',
    method: 'DELETE',
    route: '/medicos/{{medicoId}}',
    status: 204,
  },
  {
    name: '21 Verificar médico eliminado',
    route: '/medicos/{{medicoId}}',
    status: 404,
    error: 'NOT_FOUND',
  },
  {
    name: '22 Mock Server - ejemplo de médicos',
    route: `/medicos?especialidad=${nutrition}&disponible=true`,
    status: 200,
    schema: array(doctorSchema),
    mock: true,
    extra:
      'pm.test("Ejemplo simulado", () => { const data = pm.response.json(); pm.expect(data).to.have.lengthOf(1); pm.expect(data[0].id).to.eql(1); pm.expect(data[0].especialidad).to.eql("Nutrición"); });',
  },
];
const items = [];
let doctorCreated = false,
  appointmentCreated = false;
try {
  for (const c of cases) {
    const variable = c.mock ? 'mockUrl' : 'baseUrl';
    const routePath = c.route.split('?')[0];
    const queryText = c.route.split('?')[1];
    const request = {
      method: c.method ?? 'GET',
      header: c.body
        ? [{ key: 'Content-Type', value: 'application/json' }]
        : [],
      url: {
        raw: `{{${variable}}}${c.route}`,
        host: [`{{${variable}}}`],
        path: routePath.slice(1).split('/'),
        ...(queryText
          ? {
              query: queryText.split('&').map((pair) => {
                const [key, value] = pair.split('=');
                return { key, value: decodeURIComponent(value) };
              }),
            }
          : {}),
      },
      ...(c.body
        ? {
            body: {
              mode: 'raw',
              raw: raw(c.body),
              options: { raw: { language: 'json' } },
            },
          }
        : {}),
      description: c.mock
        ? 'Petición real al Mock Server de Postman con el ejemplo guardado; no ejecuta lógica del backend.'
        : 'Ejecutar la colección completa en orden con el entorno TurnosRed API 2. Los ejemplos adjuntos se capturaron de respuestas reales.',
    };
    // Puede usarse una captura HTTP real si Node no tiene acceso al proxy del sistema.
    const captured =
      c.mock && process.env.MOCK_RESPONSE_FILE
        ? JSON.parse(
            (await readFile(process.env.MOCK_RESPONSE_FILE, 'utf8')).replace(
              /^\uFEFF/,
              '',
            ),
          )
        : null;
    if (captured) assert.equal(captured.source, resolve(request.url.raw));
    const response = captured
      ? new Response(captured.body, {
          status: captured.status,
          statusText: captured.statusText,
        })
      : await fetch(resolve(request.url.raw), {
          method: request.method,
          headers: Object.fromEntries(
            request.header.map((h) => [h.key, h.value]),
          ),
          ...(c.body ? { body: resolve(request.body.raw) } : {}),
          signal: AbortSignal.timeout(15000),
        });
    const bodyText = await response.text();
    if (c.name.startsWith('01') && response.status === 201)
      doctorCreated = true;
    if (c.name.startsWith('08') && response.status === 201)
      appointmentCreated = true;
    if (c.name.startsWith('18') && response.status === 204)
      appointmentCreated = false;
    if (c.name.startsWith('20') && response.status === 204)
      doctorCreated = false;
    assert.equal(response.status, c.status, `${c.name}: ${bodyText}`);
    if (c.error) assert.equal(JSON.parse(bodyText).code, c.error);
    if (c.field)
      assert.ok(JSON.parse(bodyText).details.some((d) => d.field === c.field));
    const tests = [
      `pm.test("HTTP ${c.status}", () => { pm.response.to.have.status(${c.status}); });`,
    ];
    if (c.status === 204)
      tests.push(
        'pm.test("Sin cuerpo", () => { pm.expect(pm.response.text()).to.eql(""); });',
      );
    else tests.push(schemaTest(c.schema ?? errorSchema));
    if (c.error)
      tests.push(
        `pm.test("Error uniforme", () => { const e = pm.response.json(); pm.expect(e.status).to.eql(${c.status}); pm.expect(e.code).to.eql(${JSON.stringify(c.error)}); });`,
      );
    if (c.field)
      tests.push(
        `pm.test("Campo identificado", () => { pm.expect(pm.response.json().details.some(d => d.field === ${JSON.stringify(c.field)})).to.eql(true); });`,
      );
    if (c.extra) tests.push(c.extra);
    const event = [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: tests.join('\n\n').split('\n'),
        },
      },
    ];
    if (c.init)
      event.unshift({
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            'const id = Date.now();',
            'pm.environment.set("medicoId", id);',
            'pm.environment.set("turnoId", id + 1);',
          ],
        },
      });
    items.push({
      name: c.name,
      request,
      event,
      response: [
        {
          name: `${c.status} - ${c.name}`,
          originalRequest: structuredClone(request),
          status: response.statusText,
          code: response.status,
          _postman_previewlanguage: 'json',
          header:
            c.status === 204
              ? []
              : [
                  {
                    key: 'Content-Type',
                    value: 'application/json; charset=utf-8',
                  },
                ],
          cookie: [],
          body: bodyText ? JSON.stringify(JSON.parse(bodyText), null, 2) : '',
        },
      ],
    });
    console.log(`${response.status} ${c.name}`);
  }
  const collection = {
    info: {
      name: 'TurnosRed API 2 - Entrega',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description:
        'Ejecutar las 22 solicitudes en orden. Se generan IDs dinámicos y se eliminan los datos creados al finalizar. Incluye esquemas JSON, errores, filtros, ejemplos capturados y Mock Server. No se requiere autenticación: token se deja vacío.',
    },
    item: items,
  };
  const environment = {
    name: 'TurnosRed API 2',
    values: Object.entries({
      baseUrl: base,
      mockUrl: mock,
      medicoId: '',
      turnoId: '',
      token: '',
    }).map(([key, value]) => ({ key, value, type: 'default', enabled: true })),
    _postman_variable_scope: 'environment',
  };
  const output = (name) =>
    fileURLToPath(new URL(`../postman/${name}`, import.meta.url));
  await writeFile(
    output('turnos-red.postman_collection.json'),
    JSON.stringify(collection, null, 2) + '\n',
  );
  await writeFile(
    output('turnos-red.postman_environment.json'),
    JSON.stringify(environment, null, 2) + '\n',
  );
  await writeFile(
    output('LEEME-API2.md'),
    '# Colección API 2\n\nImportar turnos-red.postman_collection.json y turnos-red.postman_environment.json. Seleccionar el entorno TurnosRed API 2 y ejecutar las 22 solicitudes en orden desde Runner. La API debe estar en localhost:3002; la última solicitud necesita Internet para consultar el Mock Server.\n\nLa primera solicitud genera medicoId y turnoId en el entorno. Las solicitudes finales eliminan únicamente esos registros. Si se interrumpe la ejecución después de crear datos, usar las solicitudes 18 y 20 con los mismos IDs antes de empezar otra vez.\n\nLa variable token está vacía porque esta API no implementa autenticación. No agregar encabezados Authorization sin implementar primero esa funcionalidad.\n\nLos ejemplos se capturaron de respuestas reales. Los IDs en los cuerpos de ejemplo corresponden a esa ejecución. Los turnos heredados de API 1 pueden no tener medicoId.\n\nEl archivo TurnosRed.postman_collection.json es la colección anterior; para esta entrega usar turnos-red.postman_collection.json.\n',
  );
  console.log('Colección y entorno generados; datos temporales eliminados.');
} finally {
  if (appointmentCreated)
    await fetch(`${base}/turnos/${id + 1}`, { method: 'DELETE' });
  if (doctorCreated) await fetch(`${base}/medicos/${id}`, { method: 'DELETE' });
}
