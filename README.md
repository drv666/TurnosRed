# TurnosRed

Entrega de API 2: https://github.com/drv666/TurnosRed/tree/api2

Informe editable: [Evidencias API 2 en Word](docs/Informe_evidencias_API2_TurnosRed.docx).
La rama `main` conserva la entrega anterior; utilizar `api2` para esta actividad.

## Actividad práctica 2

Primer paso implementado: validación Zod para POST y PUT de turnos, middleware
de errores con `status`, `message`, `code` y `details`, y DELETE con 204 sin cuerpo.
La copia local de M-2 utiliza `PORT=3002` para distinguirla de la API 1.
También está implementado el CRUD `/medicos` y la relación `medicoId`.
Los nuevos turnos requieren un médico existente, disponible y de la misma especialidad.
Los registros históricos de API 1 pueden permanecer sin médico asignado.
Los filtros por query están implementados. La colección completa está en
`postman/turnos-red.postman_collection.json`, con su entorno en
`postman/turnos-red.postman_environment.json`. Importar ambos, seleccionar el
entorno **TurnosRed API 2** y ejecutar las 22 solicitudes en orden con Runner.
La ejecución del 16/09/2026 completó **67 tests aprobados, 0 fallidos y 0 errores**,
incluyendo la consulta real al Mock Server de Postman. Ver instrucciones en
`postman/LEEME-API2.md`. El documento de evidencia contiene cinco páginas y
se incluye en `docs/Informe_evidencias_API2_TurnosRed.docx`.

### Filtros de búsqueda

- `GET /medicos?especialidad=Nutrici%C3%B3n&disponible=true`
- `GET /turnos?especialidad=Nutrici%C3%B3n&fecha=2026-09-20&medicoId=1`

Todos los filtros son opcionales y se combinan: cada resultado debe cumplir todos
los filtros enviados. `disponible` acepta `true` o `false`; `medicoId` debe ser
un entero positivo y `fecha` una fecha válida AAAA-MM-DD. La especialidad debe
coincidir con uno de los cuatro valores permitidos. Los parámetros desconocidos,
repetidos o inválidos devuelven 400 con el formato uniforme de error.
Sin coincidencias, la API devuelve 200 y un arreglo vacío.

Pruebas de esta etapa:
`node --import tsx --test --test-concurrency=1 tests/*.test.ts`.
Estas pruebas de código no reemplazan las pruebas ni las evidencias de Postman.

### Uso de Inteligencia Artificial

Los prompts se resumen cuando la tarea se construyó en varios intercambios.
Las frases entre comillas reproducen instrucciones del estudiante. Se distingue
la implementación asistida de las acciones manuales y de las verificaciones.

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
| --- | --- | --- | --- | --- |
| Validación de turnos | Codex | Continuar API 2 paso por paso y configurar la validación con Zod | Esquema, middleware de validación, errores centralizados y pruebas | Todavía sin ajustes manuales del estudiante. El asistente revisó los tipos, permitió omitir id en PUT y comprobó errores de campo, JSON inválido y respuestas HTTP con datos temporales. |
| Recurso Médico y relación con Turno | Codex | Continuar los pasos de API 2 y preparar las pruebas del CRUD | Modelo, esquemas, rutas, controlador y servicio de médicos; validación de medicoId | El estudiante ejecutó las solicitudes indicadas y tomó capturas. La corrección de tipos y las pruebas de persistencia fueron realizadas por el asistente. |
| Filtros de consulta | Codex | Continuar con los filtros requeridos por la consigna | Query schemas y filtros combinables en servicios de turnos y médicos | El estudiante recreó el médico de prueba al obtener una lista vacía y repitió la consulta. No se suprimió la aserción que exigía resultados. |
| Scripts de Postman | Codex | "dame el codigo completo para reemplazar" | Tests de estado, filtros y esquema JSON en After response | El estudiante reemplazó el script y comprobó 3/3 pruebas aprobadas. Se conservaron los tests de estado y filtros junto con el de esquema. |
| Ejemplos y Mock Server | Codex y Postman | "ejecutalo" y "adelante", después de explicar el ejemplo y el Mock Server | Respuesta guardada, servidor de simulación y consulta remota | El asistente configuró y comprobó la respuesta 200; el estudiante tomó la captura. |
| Colección de entrega | Codex | Continuar con la revisión de los requisitos de API 2 | 22 solicitudes ordenadas, variables de entorno, ejemplos reales y 67 aserciones | El asistente importó y ejecutó la colección en Postman; el estudiante capturó el resultado 67/67. |


Backend con Node.js, TypeScript, Express y Socket.IO para normalizar y gestionar turnos médicos.

## Requisitos previos

- Node.js 24 LTS; la versión usada se indica en `.nvmrc`.
- npm (no usar otro manejador de paquetes).

## Instalación y ejecución

```bash
npm install
copy .env.example .env
npm run dev
```

Para producción: `npm run build` y luego `npm start`.
En PowerShell, si la política de ejecución bloquea `npm.ps1`, usar `npm.cmd`
en lugar de `npm` en los comandos anteriores.

## Variables de entorno

| Variable    | Descripción                   | Ejemplo              |
| ----------- | ----------------------------- | -------------------- |
| `PORT`      | Puerto HTTP del servidor      | `3002`               |
| `DATA_FILE` | Ruta del JSON de persistencia | `./data/turnos.json` |
| `DOCTORS_FILE` | Persistencia de médicos | `./data/medicos.json` |

## Scripts

- `npm run dev`: ejecuta y recarga el servidor durante el desarrollo.
- `npm run build`: compila TypeScript desde `src/` hacia `dist/`.
- `npm test`: ejecuta las pruebas de validación e integración con datos temporales.
- `npm start`: ejecuta la versión compilada.
- `npm run lint`: analiza los archivos TypeScript.
- `npm run format`: aplica Prettier.
- `npm run format:check`: verifica el formato.

## API REST

| Método | Ruta          | Resultado                           |
| ------ | ------------- | ----------------------------------- |
| GET    | `/turnos`     | Lista todos (`200`)                 |
| GET    | `/turnos/:id` | Obtiene uno (`200`, `400`, `404`)   |
| POST   | `/turnos`     | Crea uno (`201`, `400`, `404` si no existe el médico) |
| PUT    | `/turnos/:id` | Actualiza uno (`200`, `400`, `404`) |
| DELETE | `/turnos/:id` | Elimina uno (`204`, `400`, `404`)   |
| GET | `/medicos` | Lista médicos (`200`) |
| GET | `/medicos/:id` | Obtiene un médico (`200`, `400`, `404`) |
| POST | `/medicos` | Crea un médico (`201`, `400`) |
| PUT | `/medicos/:id` | Actualiza un médico (`200`, `400`, `404`) |
| DELETE | `/medicos/:id` | Elimina un médico sin turnos asociados (`204`, `400`, `404`) |

Ejemplo para POST/PUT:

```json
{
  "id": 104,
  "medicoId": 1,
  "paciente": " María López ",
  "documento": "30111222",
  "especialidad": "Nutrición",
  "fecha": "2026-09-20",
  "hora": "09:00",
  "confirmado": true,
  "observaciones": "Control"
}
```

Los cambios se persisten en el JSON configurado y los errores inesperados responden `500`.

Los errores utilizan `{ "status": 400, "message": "...", "code": "VALIDATION_ERROR", "details": [] }`.
Zod incluye en `details` el campo, el mensaje y el código del problema. El
código 500 se verificó mediante un fallo controlado en las pruebas HTTP de
código; no se incorpora una ruta de fallo artificial a la API.

### Variables y ejecución en Postman

El entorno exportado contiene `baseUrl` (API local en el puerto 3002),
`mockUrl` (servidor de Postman), `medicoId` y `turnoId` (generados al ejecutar
la primera solicitud). `token` queda vacío: esta actividad no implementa
autenticación, por lo que no se envía un encabezado Authorization ficticio.
Ejecutar la colección en orden con una iteración. Sus solicitudes de limpieza
eliminan solo los registros de esa ejecución; los ejemplos guardados quedan
disponibles. El Mock Server sirve ejemplos y no reemplaza las pruebas reales.

Ejemplo POST `/medicos`: `{"id":1,"nombre":"Médica de prueba","documento":"23456789","especialidad":"Nutrición","disponible":true}`.
En PUT se puede omitir `id`; si se incluye, debe coincidir con la URL.

## Eventos en tiempo real

El bus interno emite `turno:creado`, `turno:actualizado` y `turno:eliminado`. Socket.IO retransmite `turno:nuevo`, `turno:actualizado` y `turno:eliminado`.

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3002');
socket.on('turno:nuevo', console.log);
socket.on('turno:actualizado', console.log);
socket.on('turno:eliminado', console.log);
```

## Estructura

```text
src/
├── controllers/  # Capa HTTP
├── events/       # Bus EventEmitter
├── models/       # Interfaces
├── routes/       # Endpoints
├── schemas/      # Validaciones Zod de cuerpos y query parameters
├── middleware/   # Validación y errores uniformes
├── services/     # Normalización, persistencia y lógica
├── app.ts        # Express
└── server.ts     # HTTP, Socket.IO y arranque
```
