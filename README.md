# Todo List API

API REST para la gestión de tareas por usuario, desarrollada con Node.js, Express y MySQL.

El proyecto incluye autenticación JWT, validación de datos, aislamiento de tareas entre usuarios, documentación Swagger, pruebas automatizadas, Docker, CI con GitHub Actions y despliegue mediante imágenes versionadas publicadas en GitHub Container Registry.

---

## Descripción

Todo List API permite que cada usuario pueda registrarse, iniciar sesión y administrar sus propias tareas.

Cada usuario puede:

- Registrarse.
- Iniciar sesión.
- Crear tareas.
- Consultar sus tareas.
- Obtener una tarea por ID.
- Actualizar el título de una tarea.
- Cambiar el estado completada/pendiente.
- Actualizar varios campos de una tarea.
- Eliminar tareas.
- Filtrar tareas completadas o pendientes.

Las operaciones sobre tareas están asociadas al usuario autenticado mediante JWT.

Esto evita que un usuario pueda consultar, modificar o eliminar las tareas pertenecientes a otro usuario.

---

## Tecnologías utilizadas

### Backend

- Node.js 22
- Express
- MySQL 8
- JWT
- bcrypt
- dotenv

### Documentación

- Swagger
- Swagger UI

### Testing

- Node Test Runner
- Supertest

### DevOps

- Docker
- Docker Compose
- Git
- GitHub
- GitHub Actions
- GitHub Container Registry (GHCR)

---

## Características principales

### Autenticación

La API utiliza JWT para proteger las rutas privadas.

Las tareas utilizan el usuario obtenido desde el token:

```text
JWT
 ↓
verifyToken
 ↓
req.user.id
 ↓
consulta MySQL filtrada por user_id
```

El cliente no puede seleccionar manualmente el `user_id` propietario de una tarea.

---

## Seguridad

El proyecto incluye diferentes medidas de seguridad y validación.

Entre ellas:

- Contraseñas almacenadas utilizando bcrypt.
- Tokens JWT con tiempo de expiración.
- `JWT_SECRET` almacenado mediante variables de entorno.
- Validación del formato del token Bearer.
- Validación de correo electrónico.
- Contraseñas entre 8 y 72 caracteres.
- Títulos de tareas entre 3 y 255 caracteres.
- Validación de IDs de tareas.
- Validación del filtro `completada`.
- Aislamiento de recursos entre usuarios.
- Respuestas genéricas para errores internos.
- Las credenciales reales no forman parte del repositorio.
- `.env` está excluido mediante `.gitignore`.
- Auditoría de dependencias mediante `npm audit`.

Cuando un usuario intenta acceder a una tarea que no le pertenece, la API responde como recurso no encontrado.

Esto ayuda a evitar que un usuario pueda determinar si existe un recurso perteneciente a otra cuenta.

---

## Endpoints principales

### Autenticación

```text
POST /auth/register
POST /auth/login
```

### Tareas

```text
GET    /api/tareas
POST   /api/tareas
GET    /api/tareas/:id
PUT    /api/tareas/:id
DELETE /api/tareas/:id
PATCH  /api/tareas/:id/toggle
```

---

## Filtros

Para obtener tareas completadas:

```text
GET /api/tareas?completada=true
```

Para obtener tareas pendientes:

```text
GET /api/tareas?completada=false
```

El filtro solamente acepta:

```text
true
false
```

Un valor diferente devuelve una respuesta `400 Bad Request`.

---

## Health checks

La API dispone de endpoints para comprobar su estado.

### Health

```text
GET /health
```

Ejemplo:

```json
{
  "status": "ok",
  "service": "todo-api",
  "version": "1.0.1"
}
```

Este endpoint confirma que el proceso de la API está funcionando.

También permite identificar la versión actualmente desplegada.

### Readiness

```text
GET /ready
```

Ejemplo:

```json
{
  "status": "ready",
  "service": "todo-api",
  "database": "connected"
}
```

Este endpoint confirma que la API puede comunicarse correctamente con MySQL.

---

## Manejo de errores

Las rutas inexistentes responden en formato JSON.

Ejemplo:

```json
{
  "success": false,
  "error": "Ruta no encontrada"
}
```

Los errores internos utilizan una respuesta genérica y no exponen detalles sensibles al cliente.

Ejemplo:

```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

Los detalles técnicos permanecen únicamente en los logs del servidor.

---

## Documentación Swagger

La API dispone de documentación interactiva mediante Swagger UI.

Con la aplicación ejecutándose:

```text
http://localhost:3000/docs
```

Swagger permite consultar los endpoints disponibles y realizar pruebas utilizando autenticación Bearer JWT.

---

## Pruebas automatizadas

El proyecto cuenta con más de 30 pruebas automatizadas.

Las pruebas cubren, entre otros casos:

- Ruta principal de la API.
- Health check.
- Readiness check.
- Peticiones sin token.
- Tokens inválidos.
- Registro de usuarios.
- Inicio de sesión.
- Creación de tareas.
- Consulta de tareas.
- Consulta de tareas por ID.
- Actualización de tareas.
- Actualización parcial de campos.
- Eliminación de tareas.
- Toggle de tareas.
- Filtro de tareas completadas.
- Filtro de tareas pendientes.
- Filtros inválidos.
- Validación de títulos.
- Validación de IDs.
- Validación de tipos de datos.
- Aislamiento entre usuarios.
- Respuestas 404.
- Protección de información en errores 500.

Para ejecutar las pruebas:

```bash
cd api
npm test
```

---

## CI con GitHub Actions

El proyecto utiliza GitHub Actions para ejecutar automáticamente controles de calidad.

El pipeline de CI incluye:

```text
Checkout
   ↓
Node.js 22
   ↓
npm ci
   ↓
Validación de sintaxis
   ↓
Pruebas automatizadas
   ↓
npm audit
   ↓
Validación de Docker Compose
   ↓
Construcción de imagen Docker
```

Las pruebas de integración utilizan una instancia temporal de MySQL.

El CI permite detectar errores antes de que los cambios sean integrados a la rama principal.

---

## Docker

El proyecto dispone de dos configuraciones principales.

### Desarrollo

```text
docker-compose.yml
```

Esta configuración permite trabajar con el proyecto utilizando el código fuente local.

### Producción

```text
docker-compose.prod.yml
```

La configuración de producción utiliza una imagen Docker versionada almacenada en GitHub Container Registry.

Ejemplo:

```text
ghcr.io/graderd/todo-list-api:1.0.1
```

---

## GitHub Container Registry

Las imágenes Docker de la API se publican en:

```text
ghcr.io/graderd/todo-list-api
```

Las versiones utilizan Semantic Versioning.

Ejemplos:

```text
1.0.0
1.0.1
1.1.0
2.0.0
```

La publicación se activa mediante tags Git con formato:

```text
vX.Y.Z
```

Ejemplo:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

El workflow:

```text
.github/workflows/publish-image.yml
```

construye y publica automáticamente la imagen en GHCR.

---

## Versionado

El proyecto utiliza Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

Ejemplo:

```text
1.0.1
```

Donde:

```text
MAJOR → cambios incompatibles importantes
MINOR → nuevas funcionalidades compatibles
PATCH → correcciones y mejoras compatibles
```

La versión desplegada puede consultarse mediante:

```text
GET /health
```

---

## Despliegue

La versión utilizada en producción se controla mediante:

```env
API_VERSION=1.0.1
```

El archivo:

```text
docker-compose.prod.yml
```

utiliza esa variable para seleccionar la imagen:

```text
ghcr.io/graderd/todo-list-api:${API_VERSION}
```

De esta manera, el servidor puede ejecutar una versión específica de la API sin reconstruir el código directamente en producción.

Ejemplo de despliegue:

```bash
docker compose -f docker-compose.prod.yml pull api
docker compose -f docker-compose.prod.yml up -d api
```

---

## Rollback

Si una nueva versión presenta problemas, el proyecto permite regresar rápidamente a una versión estable anterior.

Ejemplo:

```text
1.0.1
 ↓
1.0.0
```

Se cambia:

```env
API_VERSION=1.0.0
```

y se recrea únicamente el contenedor de la API:

```bash
docker compose -f docker-compose.prod.yml up -d api
```

El contenedor de MySQL permanece funcionando durante el rollback.

Esto permite reemplazar la versión de la aplicación sin recrear la base de datos.

---

## Operación y despliegue

La guía detallada para:

- Publicar versiones.
- Descargar imágenes desde GHCR.
- Desplegar la API.
- Verificar `/health`.
- Verificar `/ready`.
- Confirmar la versión ejecutada.
- Realizar rollback.

se encuentra en:

- [Deployment Runbook](docs/deployment-runbook.md)

---

## Variables de entorno

El proyecto utiliza variables de entorno para almacenar configuraciones y credenciales.

Los archivos `.env.example` sirven como referencia para conocer las variables necesarias.

Las credenciales reales deben mantenerse únicamente en archivos `.env` locales y nunca deben subirse al repositorio.

Ejemplo:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
API_VERSION=1.0.1
```

---

## Estructura del proyecto

```text
Todo-List/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish-image.yml
│
├── api/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── Dockerfile
│   ├── app.js
│   ├── index.js
│   ├── swagger.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── docs/
│   └── deployment-runbook.md
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Flujo de desarrollo

Los cambios del proyecto siguen este flujo:

```text
Crear rama
   ↓
Desarrollar cambio
   ↓
Ejecutar pruebas
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
GitHub Actions
   ↓
Merge a main
```

Para publicar una nueva versión:

```text
Merge a main
   ↓
Crear tag vX.Y.Z
   ↓
Push del tag
   ↓
GitHub Actions
   ↓
Construcción de imagen Docker
   ↓
Publicación en GHCR
   ↓
Actualizar API_VERSION
   ↓
Deploy
   ↓
Verificar /health y /ready
   ↓
Rollback si es necesario
```

---

## Estado actual

El proyecto cuenta actualmente con:

- API REST funcional.
- Registro e inicio de sesión.
- Autenticación JWT.
- CRUD de tareas.
- Aislamiento de tareas entre usuarios.
- Validaciones de entrada.
- Filtro de tareas por estado.
- Swagger.
- MySQL.
- Docker.
- Docker Compose.
- Pruebas automatizadas.
- Pruebas de integración con MySQL.
- CI con GitHub Actions.
- Auditoría de dependencias.
- Health check.
- Readiness check.
- Manejo consistente de errores.
- Imágenes Docker versionadas.
- Publicación automática en GHCR.
- Despliegue mediante imágenes versionadas.
- Procedimiento de rollback probado.

---

## Autor

Desarrollado como proyecto práctico de Backend y DevOps.