import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appointmentSchema } from '../src/schemas/appointment.schema.js';

const valid = {
  medicoId: 1,
  id: 104,
  paciente: ' Paciente   de prueba ',
  documento: '12345678',
  especialidad: 'Nutrición',
  fecha: '2026-09-20',
  hora: '10:30',
  confirmado: true,
};

test('acepta un turno válido y limpia los espacios del paciente', () => {
  assert.equal(appointmentSchema.parse(valid).paciente, 'Paciente de prueba');
});

for (const [field, value] of [
  ['documento', 12345678],
  ['especialidad', 'NUTRICIÓN'],
  ['fecha', '2026-02-30'],
  ['hora', '25:00'],
  ['id', 0],
  ['confirmado', 'si'],
  ['paciente', '   '],
] as const) {
  test(`rechaza un valor inválido en ${field} e identifica el campo`, () => {
    const result = appointmentSchema.safeParse({ ...valid, [field]: value });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some((issue) => issue.path[0] === field));
    }
  });
}
