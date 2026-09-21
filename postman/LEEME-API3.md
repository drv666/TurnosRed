# Pruebas de API 3

Importar `turnos-red-api3-completa.postman_collection.json` en Postman.
El servidor debe estar funcionando en el puerto 3003. La colección utiliza
la variable propia `api3BaseUrl`, sin requerir el entorno de API 2.

Ejecutar las 47 solicitudes en orden, con una iteración, en Runner.
Se generan una especialidad y un profesional ficticios con identificadores
dinámicos. Se verifica su creación, consulta, actualización y eliminación.
También se comprueban cuerpos incompletos, tipos inválidos, duplicados,
IDs inexistentes y el controlador de rutas no encontradas.
Los estados 400 y 404 de los casos negativos son respuestas esperadas.
Las dos eliminaciones finales afectan únicamente los registros creados
por esta ejecución. No reiniciar el servidor durante la corrida.

Los datos de estas entidades están en memoria y vuelven a los valores
de src/data al reiniciar.

Resultado final del 21/09/2026: 117 pruebas aprobadas, 0 fallidas, 0 omitidas y 0 errores.
Las primeras 26 solicitudes cubren API 3; las 21 restantes verifican regresión de /turnos y /medicos.
La colección anterior de 26 solicitudes y 53 pruebas se conserva para reproducir la captura 19.
El Mock Server externo de API 2 no forma parte de esta comprobación del backend real.
