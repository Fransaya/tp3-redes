# Microservicio de Almacenamiento y Consulta de Temperaturas (`micro-db-5`)

Este microservicio se encarga de almacenar y consultar mediciones de temperatura provenientes de distintas fuentes. Expone endpoints REST para guardar datos y realizar consultas filtradas, y ofrece documentación interactiva mediante Swagger UI.

## Características principales

- **Almacenamiento de datos**: Guarda mediciones de temperatura asociadas a una ciudad, fuente, fecha y un identificador de traza.
- **Consulta de datos**: Permite consultar las mediciones almacenadas, filtrando por ciudad, país y fecha de captura.
- **Documentación interactiva**: Disponible en `/docs` usando Swagger UI.
- **Protección y seguridad**: Incluye rate limiting, CORS, compresión y manejo robusto de errores.

## Endpoints principales

### POST `/store/capture`

Guarda una nueva medición de temperatura.

**Body de ejemplo:**

```json
{
  "source": "web",
  "city": "Buenos Aires",
  "country": "AR",
  "value_c": 23.5,
  "captured_at": "2025-08-26T11:22:33.123Z",
  "trace_id": "2f5c1b52-5e5e-4a1e-8f1a-99d5b5ce0a00"
}
```

**Respuestas:**

- `201 Created`: Datos guardados correctamente.
- `400 Bad Request`: Faltan campos obligatorios.
- `403 Forbidden`: Fuente no autorizada.
- `500 Internal Server Error`: Error al guardar los datos.

---

### GET `/query/data`

Consulta las mediciones almacenadas, permitiendo filtrar por ciudad, país y fecha de captura.

**Parámetros de consulta:**

- `city` (opcional): Filtra por ciudad.
- `country` (opcional): Filtra por país.
- `captured_at` (opcional): Filtra por timestamp de captura.

**Respuesta de ejemplo:**

```json
{
  "status": 200,
  "data": {
    "rows": [
      {
        "source": "web",
        "city": "Buenos Aires",
        "temperature": 23.5,
        "captured_at": "2025-08-26T11:22:33.123Z",
        "trace_id": "2f5c1b52-5e5e-4a1e-8f1a-99d5b5ce0a00"
      }
      // ...
    ]
  }
}
```

---

## Documentación Swagger

Puedes acceder a la documentación interactiva en:

- [http://localhost:3001/docs](http://localhost:3001/docs)

---

## Ejecución local

1. Instala dependencias:
   ```bash
   cd micro-db-5
   npm install
   ```
2. Crea un archivo `.env` con la configuración de la base de datos.
3. Inicia el microservicio:
   ```bash
   npm start
   ```

## Ejecución con Docker

1. Construye la imagen:
   ```bash
   docker build -t db-microservice .
   ```
2. Ejecuta el contenedor:
   ```bash
   docker run -d --name db-service -p 3001:3001 \
     --env-file .env \
     db-microservice
   ```

O usa `docker-compose`:

```bash
docker-compose up --build
```

---

## Seguridad y buenas prácticas

- Rate limiting para evitar abuso.
- Manejo robusto de errores.
- Variables sensibles en `.env`.
- CORS restringido.

---

## Contacto

Para dudas o mejoras, contacta al equipo de desarrollo.
