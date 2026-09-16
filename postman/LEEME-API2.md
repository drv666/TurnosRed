# Colección API 2

Importar turnos-red.postman_collection.json y turnos-red.postman_environment.json. Seleccionar el entorno TurnosRed API 2 y ejecutar las 22 solicitudes en orden desde Runner. La API debe estar en localhost:3002; la última solicitud necesita Internet para consultar el Mock Server.

La primera solicitud genera medicoId y turnoId en el entorno. Las solicitudes finales eliminan únicamente esos registros. Si se interrumpe la ejecución después de crear datos, usar las solicitudes 18 y 20 con los mismos IDs antes de empezar otra vez.

La variable token está vacía porque esta API no implementa autenticación. No agregar encabezados Authorization sin implementar primero esa funcionalidad.

Los ejemplos se capturaron de respuestas reales. Los IDs en los cuerpos de ejemplo corresponden a esa ejecución. Los turnos heredados de API 1 pueden no tener medicoId.

El archivo TurnosRed.postman_collection.json es la colección anterior; para esta entrega usar turnos-red.postman_collection.json.
