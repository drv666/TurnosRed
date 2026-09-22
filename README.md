# TurnosRed API 4

Actividad práctica de Integraciones Web. Se agrega la propuesta de Pacientes y Turnos, la referencia de la API existente y la colección **TurnosMed API** con la variable **baseUrl**.

[Propuesta Pacientes y Turnos](pacientes-turnos.md) · [Colección Postman](postman/turnos-med-api4.postman_collection.json)

TurnosMed es el nombre de la consigna; el proyecto se llama TurnosRed. El archivo recibido como Actividad 4 tiene el encabezado interno “Actividad 2”; se siguen sus consignas de propuesta, variables y documentación.

## Instalación y ejecución

Requisitos: Node.js 24 y npm. Abrir una terminal en la raíz del proyecto.

1. Instalar las dependencias del lockfile: `npm ci`.
2. Copiar .env.example como .env: en PowerShell, `Copy-Item .env.example .env`.
3. Ejecutar en desarrollo: `npm run dev`.
4. Abrir http://localhost:3004 o enviar GET a esa dirección en Postman.

En PowerShell, si se bloquea npm.ps1, usar `npm.cmd ci` y `npm.cmd run dev`. No hace falta cambiar la política de seguridad.

```dotenv
PORT=3004
DATA_FILE=./data/turnos.json
DOCTORS_FILE=./data/medicos.json
```

Compilar: `npm run build`. Ejecutar compilado: `npm start`. Detener: Ctrl+C.
Si se cambia PORT, actualizar baseUrl en Postman. Sin .env, el servidor usa el puerto 3000.

## Organización y persistencia

```text
src/
  routes/          rutas HTTP
  controllers/     entrada y salida HTTP
  services/        operaciones y reglas
  models/          interfaces TypeScript
  schemas/         validaciones Zod
  middleware/      validación y errores
  data/            JSON ficticios de especialidades y profesionales
  events/          eventos de turnos
  app.ts           composición de la aplicación
  server.ts        servidor y Socket.IO
data/              persistencia JSON de médicos y turnos
tests/             pruebas con datos y servidores aislados
postman/           colecciones exportadas
pacientes-turnos.md propuesta del nuevo módulo
```

Especialidades y Profesionales se mantienen en memoria a partir de src/data; sus cambios se pierden al reiniciar. Médicos y Turnos persisten en data. Médico y Profesional son modelos distintos: medicoId de un turno heredado referencia /medicos.

La propuesta de Clean Architecture está en pacientes-turnos.md. **POST /pacientes y POST /pacientes/:pacienteId/turnos todavía no están implementados.**

## Convenciones de la API implementada

Origen: **http://localhost:3004**, representado por `{{baseUrl}}` en Postman.
Las respuestas con cuerpo son JSON. POST y PUT requieren `Content-Type: application/json`.
DELETE exitoso responde **204 sin cuerpo**. Los listados son arreglos directos, incluso `[]`, sin paginación ni envoltorio data.

Los IDs del path son enteros positivos en formato decimal, sin ceros iniciales, dentro del rango entero seguro. GET y DELETE no requieren body. Donde se indica “ninguna” query, no hay filtros documentados. No se implementó autenticación ni autorización; el ejercicio se ejecuta localmente con datos ficticios.

### Formato de errores

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "documento",
      "message": "El documento debe ser texto, entre comillas",
      "code": "invalid_type"
    }
  ]
}
```

Cada error tiene status numérico, message y code de texto, y details como arreglo. Cada detalle puede incluir field, message y un code opcional; algunos errores tienen details vacío.

| Estado | Código | Significado |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Entrada inválida, ID heredado duplicado o query incorrecta |
| 400 | INVALID_JSON | JSON mal formado |
| 400 | DUPLICATE_SPECIALTY | Nombre de especialidad repetido |
| 400 | DUPLICATE_REGISTRATION | Matrícula profesional repetida |
| 400 | INVALID_SPECIALTY | especialidadId inexistente |
| 400 | DOCTOR_UNAVAILABLE | Médico no disponible |
| 400 | SPECIALTY_MISMATCH | Especialidad del turno distinta de la del médico |
| 400 | DOCTOR_HAS_APPOINTMENTS | Médico con turnos que se intenta eliminar o cambiar de especialidad |
| 404 | NOT_FOUND | Ruta o recurso inexistente |
| 500 | INTERNAL_ERROR | Fallo inesperado sin detalles internos |

Todos los endpoints pueden responder 500 ante fallos inesperados. Un JSON mal formado se rechaza antes del controlador con 400 INVALID_JSON. Las tablas siguientes detallan los errores propios de cada operación.

## Referencia de endpoints

### Bienvenida y rutas desconocidas

**GET /** — comprobar acceso al servidor. Params: ninguno. Query: ninguna. Body: ninguno. Respuesta **200**:

```json
{"status":200,"message":"Hello World - Bienvenido a TurnosRed API 3"}
```

El mensaje heredado se conserva por compatibilidad; esta entrega corresponde a la actividad 4. Una ruta no registrada, por ejemplo GET /ruta-inexistente, devuelve **404**:

```json
{"status":404,"message":"Ruta no encontrada","code":"NOT_FOUND","details":[]}
```

### Especialidades

Modelo de respuesta Especialidad:

```json
{"id":1,"nombre":"Clínica médica"}
```

Body POST/PUT obligatorio:

```json
{"nombre":"Cardiología"}
```

nombre debe ser string no vacío después de trim y único sin distinguir mayúsculas. El ID se genera al crear. Los campos adicionales se ignoran; id del body no cambia el ID del path.

#### GET /especialidades

Listar. Params: Ninguno. Query: Ninguna. Body: Ninguno.

Respuesta: **200 Especialidad[]**. Errores: 500.

#### GET /especialidades/:id

Consultar una. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **200 Especialidad**. Errores: 400 ID inválido; 404 ausente.

#### POST /especialidades

Crear. Params: Ninguno. Query: Ninguna. Body: nombre.

Respuesta: **201 Especialidad**. Errores: 400 VALIDATION_ERROR o DUPLICATE_SPECIALTY.

#### PUT /especialidades/:id

Reemplazar nombre. Params: id positivo. Query: Ninguna. Body: nombre.

Respuesta: **200 Especialidad**. Errores: 400 entrada inválida o duplicado; 404 ausente.

#### DELETE /especialidades/:id

Eliminar. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **204 sin cuerpo**. Errores: 400 ID inválido; 404 ausente.

GET individual, POST y PUT devuelven el objeto completo; el listado devuelve un arreglo de esos objetos. No hay restricción de eliminación por profesionales vinculados.

### Profesionales

Modelo de respuesta Profesional:

```json
{"id":1,"nombre":"Profesional de prueba","matricula":"DEMO-001","especialidadId":2}
```

Body POST/PUT completo:

```json
{"nombre":"Profesional de prueba","matricula":"DEMO-002","especialidadId":2}
```

nombre y matricula son strings obligatorios no vacíos, recortados con trim. especialidadId es número entero positivo seguro y debe existir en /especialidades. La matrícula es única sin distinguir mayúsculas. El ID se genera al crear. Campos extra se ignoran. PUT requiere todos los campos mostrados.

#### GET /profesionales

Listar. Params: Ninguno. Query: Ninguna. Body: Ninguno.

Respuesta: **200 Profesional[]**. Errores: 500.

#### GET /profesionales/:id

Consultar uno. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **200 Profesional**. Errores: 400 ID inválido; 404 ausente.

#### POST /profesionales

Crear. Params: Ninguno. Query: Ninguna. Body: nombre, matricula, especialidadId.

Respuesta: **201 Profesional**. Errores: 400 VALIDATION_ERROR, DUPLICATE_REGISTRATION o INVALID_SPECIALTY.

#### PUT /profesionales/:id

Actualizar. Params: id positivo. Query: Ninguna. Body: Igual a POST.

Respuesta: **200 Profesional**. Errores: 400 validación, matrícula duplicada o especialidad ausente; 404 profesional ausente.

#### DELETE /profesionales/:id

Eliminar. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **204 sin cuerpo**. Errores: 400 ID inválido; 404 ausente.

GET individual, POST y PUT devuelven el objeto completo con ID; el listado devuelve un arreglo. Este recurso no está vinculado a los turnos heredados.

### Médicos

Modelo Médico y body POST:

```json
{
  "id": 501,
  "nombre": "Médica de prueba",
  "documento": "23456789",
  "especialidad": "Nutrición",
  "disponible": true
}
```

Todos los campos son obligatorios en POST. id es número entero positivo enviado por el cliente. nombre y documento son strings no vacíos. especialidad admite Clínica médica, Pediatría, Odontología o Nutrición. disponible es boolean, no texto. PUT requiere los mismos campos salvo id, opcional; si se informa debe coincidir con el path. Se rechazan campos desconocidos.

Filtros opcionales de GET /medicos, combinables con AND:

| Query param | Valor en URL | Ejemplo |
| --- | --- | --- |
| especialidad | Uno de los cuatro nombres exactos | Nutrición |
| disponible | Texto true o false | true |

Ejemplo: `{{baseUrl}}/medicos?especialidad=Nutrici%C3%B3n&disponible=true`.
Filtros desconocidos, repetidos o inválidos: 400. Sin coincidencias: 200 con `[]`.

#### GET /medicos

Listar o filtrar. Params: Ninguno. Query: especialidad, disponible. Body: Ninguno.

Respuesta: **200 Médico[]**. Errores: 400 filtros inválidos.

#### GET /medicos/:id

Consultar uno. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **200 Médico**. Errores: 400 ID inválido; 404 ausente.

#### POST /medicos

Registrar. Params: Ninguno. Query: Ninguna. Body: Modelo Médico.

Respuesta: **201 Médico**. Errores: 400 validación o ID duplicado.

#### PUT /medicos/:id

Actualizar. Params: id positivo. Query: Ninguna. Body: Modelo con id opcional.

Respuesta: **200 Médico**. Errores: 400 validación o DOCTOR_HAS_APPOINTMENTS; 404 ausente.

#### DELETE /medicos/:id

Eliminar sin turnos. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **204 sin cuerpo**. Errores: 400 ID inválido o DOCTOR_HAS_APPOINTMENTS; 404 ausente.

GET individual, POST y PUT devuelven el objeto completo del ejemplo; el listado, un arreglo. Con turnos asociados se bloquea la eliminación del médico y el cambio de su especialidad. Cambiar disponible no elimina los turnos.

### Turnos heredados

Modelo Turno y body POST:

```json
{
  "id": 601,
  "medicoId": 501,
  "paciente": "Paciente de prueba",
  "documento": "45000123",
  "especialidad": "Nutrición",
  "fecha": "2026-10-20",
  "hora": "10:30",
  "confirmado": true,
  "observaciones": "Ejemplo académico"
}
```

Crear primero el médico del ejemplo anterior o usar el ID de otro disponible cuya especialidad coincida.

| Campo | Validación |
| --- | --- |
| id | Número entero positivo obligatorio en POST; opcional en PUT, debe coincidir con el path |
| medicoId | Número entero positivo de un médico existente y disponible |
| paciente | Texto obligatorio; se recortan y normalizan espacios |
| documento | Texto no vacío, sin conversión desde número |
| especialidad | Uno de los cuatro nombres del modelo Médico, debe coincidir con el médico |
| fecha | Fecha real YYYY-MM-DD |
| hora | Texto HH:mm entre 00:00 y 23:59 |
| confirmado | Boolean true o false |
| observaciones | Texto opcional |

Se rechazan campos extra. PUT requiere todos los campos obligatorios. Esta API valida el formato de fecha, pero no exige fecha futura ni detecta superposiciones. Los registros históricos cargados desde JSON pueden no tener medicoId; las nuevas peticiones sí lo requieren.

Filtros GET /turnos: especialidad (enum), fecha (YYYY-MM-DD) y medicoId (entero positivo escrito como texto), opcionales y combinables con AND. Los filtros desconocidos, repetidos o inválidos dan 400. Ejemplo: `{{baseUrl}}/turnos?medicoId=501&fecha=2026-10-20`.

#### GET /turnos

Listar o filtrar. Params: Ninguno. Query: especialidad, fecha, medicoId. Body: Ninguno.

Respuesta: **200 Turno[]**. Errores: 400 filtros inválidos.

#### GET /turnos/:id

Consultar uno. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **200 Turno**. Errores: 400 ID inválido; 404 ausente.

#### POST /turnos

Crear y vincular a médico. Params: Ninguno. Query: Ninguna. Body: Modelo Turno.

Respuesta: **201 Turno**. Errores: 400 validación, ID duplicado, DOCTOR_UNAVAILABLE o SPECIALTY_MISMATCH; 404 médico ausente.

#### PUT /turnos/:id

Actualizar. Params: id positivo. Query: Ninguna. Body: Igual a POST con id opcional.

Respuesta: **200 Turno**. Errores: 400 validación, DOCTOR_UNAVAILABLE o SPECIALTY_MISMATCH; 404 turno o médico ausente.

#### DELETE /turnos/:id

Eliminar. Params: id positivo. Query: Ninguna. Body: Ninguno.

Respuesta: **204 sin cuerpo**. Errores: 400 ID inválido; 404 ausente.

GET individual, POST y PUT devuelven un objeto completo; GET listado devuelve un arreglo. Se emiten eventos Socket.IO turno:nuevo, turno:actualizado y turno:eliminado; no son endpoints REST adicionales.

## Pruebas en Postman

1. Importar `postman/turnos-med-api4.postman_collection.json`.
2. Abrir **TurnosMed API → Variables** y comprobar **baseUrl = http://localhost:3004**.
3. Seleccionar **No environment**, para que un entorno anterior no reemplace baseUrl.
4. Abrir GET /especialidades, cuya URL es `{{baseUrl}}/especialidades`.
5. Presionar Send; comprobar 200, JSON y pruebas aprobadas.
6. Ejecutar Run con las 47 solicitudes en orden y una iteración.

Todas las URLs guardadas usan baseUrl. La colección crea sus registros ficticios, comparte sus IDs con variables y los elimina al finalizar. No ejecutar dos Runner simultáneos sobre la misma colección. Un 400 esperado es correcto cuando pasan las aserciones del caso negativo.

## Pruebas de código

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

Las pruebas usan datos y servidores aislados. Si Windows impide crear procesos secundarios del runner, ejecutar la misma suite en un proceso:

```powershell
node --import tsx --input-type=module -e 'for(const f of ["appointment-schema","doctor-http","especialidades-http","general-http","profesionales-http","validation-http"]) await import("./tests/"+f+".test.ts");'
```

## Entrega y asistencia de IA

El código fuente está en src, los datos ficticios en src/data y data, y el contrato propuesto en pacientes-turnos.md. .gitignore excluye node_modules, dist y .env. .env.example solo contiene configuración de ejemplo y sí se distribuye.

Los informes y colecciones con API2 o API3 en su nombre son antecedentes. La colección de esta actividad es TurnosMed API. Codex asistió en propuesta, documentación y pruebas; la referencia se contrastó con rutas, controladores, schemas y servicios. El módulo propuesto deberá implementarse y probarse antes de utilizarlo con un backend real.

## Evidencias de la actividad 4

Repositorio: https://github.com/drv666/TurnosRed/tree/api4

[Informe PDF](docs/Informe_API4_TurnosRed.pdf) · [Word editable](docs/Informe_API4_TurnosRed.docx) · [Resultados de pruebas](docs/PRUEBAS_API4.txt)

El 21/09/2026 se verificaron 47 solicitudes en Postman: **117 aserciones aprobadas, 0 fallidas, 0 omitidas y 0 errores**. También pasaron 13 pruebas de código, la compilación TypeScript y ESLint. Las capturas reales se encuentran en docs/capturas-api4.
