# Propuesta del módulo Pacientes y Turnos

Actividad 4 de Integraciones Web · TurnosRed (TurnosMed en la consigna).

## Alcance

Este documento define el contrato RESTful que podrá consumir el frontend para registrar pacientes y asignarles turnos. Es una **propuesta técnica con ejemplos de mockup**, no una implementación de estas rutas. Las pruebas de la colección TurnosMed API se ejecutan sobre los endpoints existentes documentados en el README.

Se proponen exactamente dos endpoints nuevos: **POST /pacientes** y **POST /pacientes/:pacienteId/turnos**. La segunda ruta expresa la relación con el paciente y evita modificar el contrato heredado de POST /turnos. El módulo nuevo utilizará Profesionales; el recurso Médico de la entrega anterior conserva su funcionamiento independiente.

## Requerimientos y modelado conceptual

Un paciente representa a una persona registrada. Su ID interno identifica el recurso; el DNI se almacena como texto para preservar su representación y evitar operaciones aritméticas. Nombre y apellido separados permiten búsquedas y presentación. La fecha de nacimiento permite calcular la edad sin guardar un valor que envejece. Se requiere al menos un medio de contacto para comunicar la asignación.

| Campo de Paciente | Tipo | Regla propuesta |
| --- | --- | --- |
| id | number | Entero positivo generado por el servidor, inmutable |
| dni | string | 7 u 8 dígitos, sin puntos, único; alcance académico para DNI argentino |
| nombre | string | Obligatorio, se recortan espacios, de 1 a 100 caracteres |
| apellido | string | Obligatorio, se recortan espacios, de 1 a 100 caracteres |
| fechaNacimiento | string | Fecha real YYYY-MM-DD que no sea futura |
| contacto.email | string opcional | Formato de correo válido, máximo 254 caracteres |
| contacto.telefono | string opcional | Formato internacional, signo + y entre 8 y 15 dígitos |

La regla de DNI es una decisión del ejercicio, no una validación de identidad oficial. Se exige email o teléfono, y se validan ambos cuando se informan. Los campos desconocidos se rechazan. No se solicitan domicilio, historia clínica ni diagnósticos para esta operación.

Un turno une **un paciente** y **un profesional** en un intervalo de tiempo. Un paciente o profesional puede tener muchos turnos, pero cada turno tiene una sola referencia a cada uno. La especialidad se obtiene del profesional; no se repite el DNI ni el nombre del paciente en el turno.

| Campo de TurnoPaciente | Tipo | Regla propuesta |
| --- | --- | --- |
| id | number | Entero positivo generado por el servidor |
| pacienteId | number | Referencia a un paciente existente; se toma del path |
| profesionalId | number | Referencia a un profesional existente |
| inicio | string | Fecha y hora ISO 8601 con zona explícita, futura; se guarda en UTC |
| duracionMinutos | number | Entero entre 15 y 120, múltiplo de 15 |
| estado | EstadoTurno | Se asigna pendiente al crear; no lo decide el cliente |

El intervalo se interpreta como [inicio, fin): dos turnos contiguos son válidos. Se rechazan superposiciones del mismo profesional o paciente con turnos pendientes o confirmados. Se debe comprobar la agenda laboral del profesional. La agenda y el control de concurrencia requieren implementación futura; no existen en el endpoint heredado /turnos.

## Interfaces TypeScript

```typescript
type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado';

interface ContactoPaciente {
  email?: string;
  telefono?: string;
}

interface Paciente {
  readonly id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  contacto: ContactoPaciente;
}

type CrearPacienteDTO = Omit<Paciente, 'id'>;

interface TurnoPaciente {
  readonly id: number;
  readonly pacienteId: number;
  profesionalId: number;
  inicio: string;
  duracionMinutos: number;
  estado: EstadoTurno;
}

interface AsignarTurnoDTO {
  profesionalId: number;
  inicio: string;
  duracionMinutos: number;
}
```

Las interfaces describen tipos estáticos. La futura implementación deberá validar estos datos en ejecución: un tipo string por sí solo no valida una fecha, un DNI ni un correo.

## Clean Architecture

La dirección de las dependencias apunta hacia el dominio. El dominio y los casos de uso no importan Express ni conocen archivos JSON, bases de datos o códigos HTTP.

```text
src/modules/pacientes-turnos/       (estructura propuesta)
  domain/                         Paciente, TurnoPaciente y reglas
  application/                    RegistrarPaciente, AsignarTurno
    ports/                        interfaces de repositorios y agenda
  infrastructure/                 adaptadores JSON o base de datos
  interfaces/http/                rutas, validadores y controladores
```

1. El router selecciona el controlador según método y path.
2. El controlador valida la estructura y construye el DTO. Invoca el caso de uso y transforma su resultado o error en HTTP.
3. RegistrarPaciente comprueba la unicidad del DNI. AsignarTurno comprueba referencias, fecha, agenda y ausencia de superposición.
4. Los casos de uso dependen de puertos; infraestructura implementa esos puertos y persiste los datos. La composición de dependencias se realiza en el arranque.

```typescript
interface PacienteRepository {
  buscarPorId(id: number): Promise<Paciente | null>;
  buscarPorDni(dni: string): Promise<Paciente | null>;
  crear(datos: CrearPacienteDTO): Promise<Paciente>;
}

interface AgendaPort {
  estaDisponible(profesionalId: number, inicio: string,
    duracionMinutos: number): Promise<boolean>;
}

interface TurnoRepository {
  // Comprobar superposición y guardar en una operación atómica.
  // El adaptador debe rechazar conflictos concurrentes.
  reservar(datos: Omit<TurnoPaciente, 'id'>): Promise<TurnoPaciente>;
}
```

Una consulta de disponibilidad seguida por una inserción sin protección permitiría reservas dobles. El adaptador deberá garantizar la reserva atómica y la unicidad del DNI mediante una transacción/restricción o una cola si se usa almacenamiento JSON en un solo proceso. Es una decisión pendiente de implementación y prueba.

## Endpoint 1 Registrar paciente

**POST /pacientes** — propuesto, aún no disponible en el servidor.

Headers: Content-Type: application/json. Params: ninguno. Query: ninguno.
Body: CrearPacienteDTO, todos los campos obligatorios salvo los medios de contacto individuales; debe existir al menos uno.

```json
{
  "dni": "45000123",
  "nombre": "Ana",
  "apellido": "Prueba",
  "fechaNacimiento": "2000-05-10",
  "contacto": {
    "email": "ana.prueba@example.com",
    "telefono": "+5491100000000"
  }
}
```

**201 Created** — devuelve el paciente con ID generado:

```json
{
  "id": 1,
  "dni": "45000123",
  "nombre": "Ana",
  "apellido": "Prueba",
  "fechaNacimiento": "2000-05-10",
  "contacto": {
    "email": "ana.prueba@example.com",
    "telefono": "+5491100000000"
  }
}
```

Errores previstos: 400 VALIDATION_ERROR (DNI numérico, contacto ausente o fecha inválida), 400 INVALID_JSON (JSON mal formado), 409 PATIENT_ALREADY_EXISTS (DNI registrado), 500 INTERNAL_ERROR (fallo inesperado). El cliente no puede enviar id.

## Endpoint 2 Asignar turno al paciente

**POST /pacientes/:pacienteId/turnos** — propuesto, aún no disponible en el servidor.

Headers: Content-Type: application/json. Params: pacienteId, entero positivo. Query: ninguno.
Body: AsignarTurnoDTO. profesionalId debe referenciar un Profesional existente.
Ejemplo de path: /pacientes/1/turnos. La fecha del ejemplo debe reemplazarse por una fecha futura al implementar la prueba.

```json
{
  "profesionalId": 1,
  "inicio": "2026-10-20T10:30:00-03:00",
  "duracionMinutos": 30
}
```

**201 Created** — devuelve el turno con la hora normalizada a UTC:

```json
{
  "id": 1,
  "pacienteId": 1,
  "profesionalId": 1,
  "inicio": "2026-10-20T13:30:00Z",
  "duracionMinutos": 30,
  "estado": "pendiente"
}
```

Errores previstos: 400 VALIDATION_ERROR (ID, fecha sin zona, fecha pasada o duración inválida), 400 INVALID_JSON, 404 PATIENT_NOT_FOUND, 404 PROFESSIONAL_NOT_FOUND, 409 SLOT_UNAVAILABLE (fuera de agenda o superposición), 500 INTERNAL_ERROR. No se aceptan id, pacienteId ni estado en el body.

## Formato de error propuesto

```json
{
  "status": 409,
  "message": "El horario solicitado no está disponible",
  "code": "SLOT_UNAVAILABLE",
  "details": [
    { "field": "inicio", "message": "Elegí otro horario" }
  ]
}
```

El frontend puede presentar message al usuario y asociar details a los campos. Nunca se devolverán trazas, rutas internas ni datos de otros pacientes. Los nombres, documentos y contactos de este archivo son ficticios.

## Casos de aceptación para una implementación futura

| Caso | Resultado esperado |
| --- | --- |
| Paciente válido con un medio de contacto | 201, ID generado |
| DNI repetido | 409 PATIENT_ALREADY_EXISTS |
| DNI numérico o falta de contacto | 400 VALIDATION_ERROR |
| Turno válido para paciente y profesional existentes | 201, referencias correctas y estado pendiente |
| Paciente o profesional ausente | 404 con código específico |
| Dos reservas concurrentes para el mismo intervalo | Una 201 y otra 409 |
| Fecha pasada, sin zona o duración no admitida | 400 VALIDATION_ERROR |

Estos casos son criterios de aceptación; no se presentan como pruebas ya ejecutadas. Antes de usar datos reales deben definirse autenticación, autorización, protección de datos y persistencia adecuada. El ejercicio actual usa datos ficticios y ejecución local.
