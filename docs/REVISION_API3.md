# Revisión de requisitos de API 3

Revisión realizada el 21 de septiembre de 2026 contra la consigna Actividad 3.docx
(el encabezado interno del archivo dice Actividad 2).

| Requisito | Implementación o evidencia | Estado |
| --- | --- | --- |
| Controladores por entidad | EspecialidadesController y ProfesionalesController en src/controllers | Cumplido |
| Controlador general | general.controller.ts: bienvenida y rutaNoEncontrada | Cumplido |
| Métodos exportados async | Todos los handlers de los cinco archivos de controladores | Cumplido |
| Variable de estado por controlador | status local en cada handler | Cumplido |
| Validar antes de operar | ID entero positivo, cuerpo, tipos, nombre, matrícula y especialidad existente | Cumplido |
| Lanzar errores de validación | new Error en controladores nuevos; ApiError extiende Error para errores tipados | Cumplido |
| return explícito | Cada respuesta retorna res.status(status).json; DELETE 204 usa end sin cuerpo | Cumplido |
| try-catch y JSON de error | status, message, code, details; errores inesperados 500 | Cumplido |
| JSON en src/data y arreglos temporales | Especialidades y profesionales se inicializan desde JSON y se reinician al arrancar | Cumplido |
| Pruebas Postman y regresión | 47 solicitudes, 117 pruebas aprobadas, 0 fallidas y 0 errores | Cumplido |
| Happy y unhappy paths | CRUD, cuerpos incompletos, tipos incorrectos, duplicados, IDs inválidos e inexistentes | Cumplido |
| Capturas de endpoints y ruta 404 | 20 capturas en informe PDF y Word | Cumplido |
| Código y documentación | src, src/controllers, src/data, package.json, lockfile, README y colección | Cumplido |

## Verificación técnica

- Compilación TypeScript completa: aprobada; los JSON se copian a dist/data.
- ESLint de src y tests: aprobado.
- Suite de código: 13 pruebas aprobadas. Se ejecutaron todos los archivos en un
  proceso Node con tsx porque el lanzador multiproceso del entorno Windows
  produjo un error intermitente spawn EPERM. Las mismas pruebas pasaron sin aislamiento.
- Postman Runner sobre dist/server.js en puerto 3003: 117 aprobadas de 117.
- Las solicitudes de regresión eliminan solo los registros ficticios que crean.
  Los archivos data/medicos.json y data/turnos.json conservaron su contenido original.

## Alcance

La persistencia temporal requerida se aplica a Especialidades y Profesionales.
Las rutas heredadas /turnos y /medicos conservan su persistencia anterior por compatibilidad.
No se agregó una base de datos ni autenticación. La entrega no incluye node_modules,
dist, .git ni el archivo local .env; las dependencias se instalan con npm.cmd ci.
