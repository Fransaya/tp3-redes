# tp3-redes

# Microservicio de Autenticación (`micro-auth-4`)

Este microservicio forma parte del TP3 de Redes y se encarga de la autenticación de usuarios y la gestión de tokens JWT.

## Características principales
- **Login de usuario** (`/auth/login`): recibe usuario y contraseña, valida credenciales y entrega tokens JWT (access y refresh).
- **Refresh de token** (`/token/refresh`): permite obtener un nuevo access token usando un refresh token válido.
- **Documentación interactiva**: disponible en `/docs` usando Swagger UI.

## Estructura de carpetas relevante
- `src/controller/`: controladores de endpoints (`auth.controller.js`, `token.controller.js`)
- `src/middleware/`: middlewares de seguridad y validación
- `src/utils/`: utilidades como generación de JWT
- `src/config/`: configuración de base de datos
- `swagger.yaml`: especificación OpenAPI de la API

## Endpoints principales

### POST `/auth/login`
- **Descripción:** Autentica usuario y retorna tokens JWT.
- **Body:**
  ```json
  {
    "username": "usuario",
    "password": "contraseña"
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "status": "success",
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": 1, "username": "usuario" },
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
  ```

### POST `/token/refresh`
- **Descripción:** Obtiene un nuevo access token usando un refresh token válido.
- **Respuesta exitosa:**
  ```json
  {
    "status": "success",
    "accessToken": "..."
  }
  ```

## Documentación Swagger
Puedes ver y probar la API desde el navegador accediendo a:
- [http://localhost:3000/docs](http://localhost:3000/docs)

## Ejecución local
1. Instala dependencias:
   ```bash
   cd micro-auth-4
   npm install
   ```
2. Crea un archivo `.env` con la configuración de la base de datos.
3. Inicia el microservicio:
   ```bash
   npm start
   ```

## Ejecución con Docker
Ver instrucciones en `micro-auth-4/DOC.MD`.

## Seguridad
- Contraseñas hasheadas con bcrypt.
- Tokens JWT firmados y verificados.
- Rate limiting y headers de seguridad.

## Contacto
Para dudas o mejoras, contacta al equipo de desarrollo.
