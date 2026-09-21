# TurnosRed API 3

Entrega: https://github.com/drv666/TurnosRed/tree/api3

[Informe PDF](docs/Informe_API3_TurnosRed.pdf) · [Word editable](docs/Informe_API3_TurnosRed.docx) · [Revisión de requisitos](docs/REVISION_API3.md)

Actividad práctica de Integraciones Web: controladores de Especialidades y
Profesionales, asincronismo, validaciones y respuestas HTTP.

## Instalación y ejecución

Requiere Node.js 24 y npm. Desde la carpeta del proyecto:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

La configuración de ejemplo usa http://localhost:3003.
Si npm presenta problemas en PowerShell, después de instalar las dependencias:

```powershell
$env:PORT="3003"
node --watch --import tsx src/server.ts
```

Compilación: `npm.cmd run build`. Ejecución compilada: `npm.cmd start`.

## Arquitectura de API 3

- src/routes: conecta endpoints con métodos de los controladores.
- src/controllers/especialidades.controller.ts y profesionales.controller.ts:
  validaciones de entrada, métodos async, variable status, try-catch y return explícito.
- src/controllers/general.controller.ts: bienvenida y rutas inexistentes.
- src/services: operaciones sobre arreglos, nombres y matrículas únicos, validación
  de existencia de la especialidad asociada a un profesional.
- src/models: interfaces de las entidades.
- src/data: JSON inicial de especialidades y profesionales.

Estas dos entidades se mantienen en memoria. Sus modificaciones se pierden al
reiniciar y no sobrescriben los JSON iniciales. Los controladores validan IDs y
cuerpos antes de solicitar operaciones al servicio. Los errores se devuelven
como {status, message, code, details}. DELETE 204 termina sin cuerpo.

## Endpoints de API 3

| Método | Ruta | Respuesta exitosa |
| --- | --- | --- |
| GET | / | 200, bienvenida |
| GET | /especialidades | 200, arreglo |
| GET | /especialidades/:id | 200, especialidad |
| POST | /especialidades | 201, especialidad creada |
| PUT | /especialidades/:id | 200, especialidad actualizada |
| DELETE | /especialidades/:id | 204, sin cuerpo |
| GET | /profesionales | 200, arreglo |
| GET | /profesionales/:id | 200, profesional |
| POST | /profesionales | 201, profesional creado |
| PUT | /profesionales/:id | 200, profesional actualizado |
| DELETE | /profesionales/:id | 204, sin cuerpo |

Ruta desconocida o recurso ausente: 404. ID, cuerpo o tipo inválido: 400.
Especialidad asociada inexistente o matrícula duplicada: 400.
Fallo inesperado: 500 sin exponer detalles internos.

Cuerpo POST/PUT de especialidad: `{"nombre":"Cardiología"}`.
Cuerpo POST/PUT de profesional:

```json
{"nombre":"Profesional de prueba","matricula":"DEMO-002","especialidadId":2}
```

El ID se genera al crear y se toma de la ruta al actualizar.

## Pruebas en Postman

Importar postman/turnos-red-api3-completa.postman_collection.json y ejecutar las
47 solicitudes en orden, con una iteración. La colección contiene su propia
variable api3BaseUrl (puerto 3003), por lo que no requiere un entorno externo.
Ver postman/LEEME-API3.md.

Resultado observado el 21/09/2026: **117 pruebas aprobadas, 0 fallidas,
0 omitidas y 0 errores**. La colección crea sus propios registros ficticios,
verifica happy y unhappy paths y los elimina al terminar.

## Pruebas de código

```powershell
npm.cmd test
node node_modules/typescript/bin/tsc --noEmit
```

Las pruebas HTTP usan servidores y datos aislados. Para ejecutar la suite nueva
sin procesos secundarios del runner:

```powershell
node --import tsx tests/general-http.test.ts
node --import tsx tests/especialidades-http.test.ts
node --import tsx tests/profesionales-http.test.ts
```

## Compatibilidad con API 2

Se conservan /turnos y /medicos, sus validaciones, persistencia JSON en data y
eventos Socket.IO. Su modelo Médico no es el recurso Profesional de API 3.
La colección completa incorpora 21 solicitudes de regresión de estas rutas.
Todos los métodos de los controladores heredados también usan async, status, try-catch y return. Los documentos y colecciones antiguos conservados en el repositorio
corresponden a entregas anteriores.

## Evidencias y asistencia

La carpeta de entrega M-3/Entrega contiene el informe de evidencias en PDF y Word.
Se incluyen 20 capturas: pruebas individuales y resultado integrado del Runner.
Codex asistió en código, pruebas y documentación; Darío tomó las capturas durante
la revisión paso a paso. No se implementó una base de datos para las entidades
nuevas ni se afirma que sus datos sobrevivan al reinicio.
