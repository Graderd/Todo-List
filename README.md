# Todo List API

API REST para gestión de tareas con autenticación JWT, MySQL, Docker y documentación Swagger.

## Descripción

Este proyecto permite a los usuarios registrarse, iniciar sesión y gestionar sus propias tareas.

Cada usuario puede:

- Crear tareas
- Ver sus tareas
- Obtener una tarea por ID
- Actualizar tareas
- Eliminar tareas
- Cambiar el estado de completada/pendiente
- Filtrar tareas completadas o incompletas

## Tecnologías utilizadas

- Node.js
- Express
- MySQL
- Docker
- Docker Compose
- JWT
- bcrypt
- dotenv
- Swagger
- Git/GitHub

## Estructura del proyecto

```text
Todo-List/
├── api/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── swagger.js
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md