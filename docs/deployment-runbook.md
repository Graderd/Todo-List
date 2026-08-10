# Deployment Runbook - Todo List API

Guía operativa para publicar, desplegar, verificar y realizar rollback de la Todo List API en producción.

---

## Arquitectura de despliegue

La API se distribuye mediante imágenes Docker versionadas almacenadas en GitHub Container Registry (GHCR).

Ejemplo:

```text
ghcr.io/graderd/todo-list-api:1.0.1
```

El servidor utiliza el archivo:

```text
docker-compose.prod.yml
```

La versión desplegada se controla mediante `API_VERSION` en el archivo `.env`.

Ejemplo:

```env
API_VERSION=1.0.1
```

Docker Compose utiliza esa variable para seleccionar la imagen:

```text
ghcr.io/graderd/todo-list-api:${API_VERSION}
```

---

## Flujo de publicación

```text
Cambios de código
        ↓
Pull Request
        ↓
GitHub Actions
        ↓
CI aprobado
        ↓
Merge a main
        ↓
Tag vX.Y.Z
        ↓
GitHub Actions
        ↓
Construcción de imagen Docker
        ↓
Publicación en GHCR
        ↓
Despliegue en producción
```

---

## Publicar una nueva versión

Las imágenes Docker se publican al enviar un tag Git con formato:

```text
vX.Y.Z
```

Ejemplo:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

Esto activa:

```text
.github/workflows/publish-image.yml
```

GitHub Actions construye y publica la imagen correspondiente en GHCR.

---

## Verificar la imagen

Descargar una versión:

```bash
docker pull ghcr.io/graderd/todo-list-api:1.0.1
```

Comprobar la versión registrada en la imagen:

```bash
docker image inspect ghcr.io/graderd/todo-list-api:1.0.1 \
  --format 'Versión: {{index .Config.Labels "org.opencontainers.image.version"}}'
```

Resultado esperado:

```text
Versión: 1.0.1
```

Listar las imágenes disponibles:

```bash
docker images ghcr.io/graderd/todo-list-api
```

---

## Comprobar producción antes del despliegue

Ver la versión configurada:

```bash
grep '^API_VERSION=' .env
```

Comprobar qué imagen está utilizando el contenedor:

```bash
docker inspect todo-api \
  --format 'Imagen: {{.Config.Image}}'
```

Comprobar los servicios:

```bash
docker compose -f docker-compose.prod.yml ps
```

---

## Desplegar una versión

Cambiar `API_VERSION` en `.env`.

Ejemplo:

```env
API_VERSION=1.0.1
```

Confirmar la versión:

```bash
grep '^API_VERSION=' .env
```

Descargar la imagen:

```bash
docker compose -f docker-compose.prod.yml pull api
```

Recrear únicamente la API:

```bash
docker compose -f docker-compose.prod.yml up -d api
```

Esperar unos segundos:

```bash
sleep 10
```

Comprobar los contenedores:

```bash
docker compose -f docker-compose.prod.yml ps
```

La API debe aparecer como `healthy`.

---

## Verificar el despliegue

Confirmar la imagen ejecutada:

```bash
docker inspect todo-api \
  --format 'Imagen: {{.Config.Image}}'
```

Comprobar el health check:

```bash
curl -sS http://localhost:3000/health && echo
```

Ejemplo:

```json
{
  "status": "ok",
  "service": "todo-api",
  "version": "1.0.1"
}
```

Comprobar readiness:

```bash
curl -sS http://localhost:3000/ready && echo
```

Ejemplo:

```json
{
  "status": "ready",
  "service": "todo-api",
  "database": "connected"
}
```

Comprobar también el manejador 404:

```bash
curl -sS http://localhost:3000/ruta-inexistente && echo
```

Ejemplo:

```json
{
  "success": false,
  "error": "Ruta no encontrada"
}
```

---

## Rollback

Si una nueva versión presenta problemas, se debe regresar a una versión estable anterior.

Ejemplo:

```text
Versión nueva:    1.0.1
Versión anterior: 1.0.0
```

Cambiar la versión:

```bash
sed -i 's/^API_VERSION=.*/API_VERSION=1.0.0/' .env
```

Confirmar:

```bash
grep '^API_VERSION=' .env
```

Recrear únicamente la API:

```bash
docker compose -f docker-compose.prod.yml up -d api
```

Esperar:

```bash
sleep 10
```

Comprobar los servicios:

```bash
docker compose -f docker-compose.prod.yml ps
```

Confirmar la imagen:

```bash
docker inspect todo-api \
  --format 'Imagen: {{.Config.Image}}'
```

Verificar:

```bash
curl -sS http://localhost:3000/health && echo
curl -sS http://localhost:3000/ready && echo
```

El rollback reemplaza únicamente el contenedor de la API.

El contenedor de MySQL permanece funcionando.

---

## Restaurar la versión actual

Después de una prueba de rollback se puede volver a desplegar la versión actual.

Ejemplo:

```bash
sed -i 's/^API_VERSION=.*/API_VERSION=1.0.1/' .env

docker compose -f docker-compose.prod.yml up -d api
```

Después verificar:

```bash
sleep 10

docker inspect todo-api \
  --format 'Imagen: {{.Config.Image}}'

curl -sS http://localhost:3000/health && echo
curl -sS http://localhost:3000/ready && echo
```

---

## Regla para producción

No utilizar `latest` como referencia principal en producción.

Evitar:

```text
ghcr.io/graderd/todo-list-api:latest
```

Preferir una versión exacta:

```text
ghcr.io/graderd/todo-list-api:1.0.1
```

Esto permite conocer exactamente qué código se está ejecutando y facilita un rollback predecible.

---

## Comandos rápidos

### Estado de producción

```bash
docker compose -f docker-compose.prod.yml ps
```

### Versión configurada

```bash
grep '^API_VERSION=' .env
```

### Imagen ejecutada

```bash
docker inspect todo-api \
  --format 'Imagen: {{.Config.Image}}'
```

### Health

```bash
curl -sS http://localhost:3000/health && echo
```

### Readiness

```bash
curl -sS http://localhost:3000/ready && echo
```

### Últimos logs

```bash
docker logs --tail 100 todo-api
```

### Logs en tiempo real

```bash
docker logs -f todo-api
```

---

## Procedimiento resumido

```text
Nueva versión en GHCR
        ↓
Cambiar API_VERSION
        ↓
Descargar imagen
        ↓
Recrear API
        ↓
Comprobar healthy
        ↓
Verificar /health
        ↓
Verificar /ready
        ↓
¿Funciona correctamente?
     ↙             ↘
   Sí               No
   ↓                ↓
Finalizar        Rollback
                    ↓
              Versión anterior
```