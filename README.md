# TurnosRed

Backend con Node.js, TypeScript, Express y Socket.IO para normalizar y gestionar turnos médicos.

## Requisitos previos

- NVM y Node.js 24 LTS (`nvm use` lee `.nvmrc`).
- npm (no usar otro manejador de paquetes).

## Instalación y ejecución

```bash
nvm use
npm install
copy .env.example .env
npm run dev
```

Para producción: `npm run build` y luego `npm start`.

## Variables de entorno

| Variable    | Descripción                   | Ejemplo              |
| ----------- | ----------------------------- | -------------------- |
| `PORT`      | Puerto HTTP del servidor      | `3000`               |
| `DATA_FILE` | Ruta del JSON de persistencia | `./data/turnos.json` |

## Scripts

- `npm run dev`: ejecuta y recarga el servidor durante el desarrollo.
- `npm run build`: compila TypeScript desde `src/` hacia `dist/`.
- `npm start`: ejecuta la versión compilada.
- `npm run lint`: analiza los archivos TypeScript.
- `npm run format`: aplica Prettier.
- `npm run format:check`: verifica el formato.

## API REST

| Método | Ruta          | Resultado                           |
| ------ | ------------- | ----------------------------------- |
| GET    | `/turnos`     | Lista todos (`200`)                 |
| GET    | `/turnos/:id` | Obtiene uno (`200`, `400`, `404`)   |
| POST   | `/turnos`     | Crea uno (`201`, `400`)             |
| PUT    | `/turnos/:id` | Actualiza uno (`200`, `400`, `404`) |
| DELETE | `/turnos/:id` | Elimina uno (`200`, `400`, `404`)   |

Ejemplo para POST/PUT:

```json
{
  "id": "104",
  "paciente": " María López ",
  "documento": 30111222,
  "especialidad": "NUTRICIÓN",
  "fecha": "20/08/2026",
  "hora": "09.00",
  "confirmado": "sí",
  "observaciones": "Control"
}
```

Los cambios se persisten en el JSON configurado y los errores inesperados responden `500`.

## Eventos en tiempo real

El bus interno emite `turno:creado`, `turno:actualizado` y `turno:eliminado`. Socket.IO retransmite `turno:nuevo`, `turno:actualizado` y `turno:eliminado`.

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
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
├── services/     # Normalización, persistencia y lógica
├── app.ts        # Express
└── server.ts     # HTTP, Socket.IO y arranque
```
