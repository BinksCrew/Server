# API del Dashboard Administrativo

Documentación completa de la API NestJS (prefijo global `/api`) para integrarla con el dashboard administrativo.

## Autenticación y roles
- Esquema: JWT Bearer en `Authorization: Bearer <token>`.
- Roles: `admin`, `super-user`, `user`. Los endpoints marcados con `admin` requieren ese rol; los que indican "Autenticado" aceptan cualquier rol válido.
- Swagger: `/api/docs`.

## Resumen rápido de rutas
- Salud: `GET /api/health` (pública).
- Auth: `POST /api/auth/register`, `POST /api/auth/login` (públicas).
- Users: `POST /api/users` (pública), `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id` (todas las de lectura/edición requieren `admin`).
- Questions: `POST /api/questions` (`admin`), `GET /api/questions` (autenticado), `GET /api/questions/:id` (autenticado), `PATCH /api/questions/:id` (`admin`), `DELETE /api/questions/:id` (`admin`), `POST /api/questions/:id/answer` (autenticado).

## Endpoints detallados

### Auth
#### POST /api/auth/register
- Acceso: Público.
- Content-Type: `application/json`.
- Body:
```json
{
  "cedula": "1234567890",
  "email": "user@mail.com",
  "password": "secret123",
  "fullName": "Nombre Apellido",
  "username": "alias",
  "phone": "+57 3000000000"
}
```
- Respuesta 201:
```json
{
  "id": "uuid",
  "email": "user@mail.com",
  "cedula": "1234567890",
  "fullName": "Nombre Apellido",
  "username": "alias",
  "phone": "+57 3000000000",
  "photo_url": null,
  "isActive": true,
  "roles": ["user"],
  "token": "<jwt>"
}
```

#### POST /api/auth/login
- Acceso: Público.
- Content-Type: `application/json`.
- Body:
```json
{
  "email": "admin@mail.com",
  "password": "secret123"
}
```
- Respuesta 201:
```json
{
  "id": "uuid",
  "email": "admin@mail.com",
  "fullName": "Admin",
  "roles": ["admin", "user"],
  "isActive": true,
  "token": "<jwt>"
}
```

### Users
#### POST /api/users
- Acceso: Público (útil para onboarding controlado). Considera protegerlo si solo admin debe crear.
- Content-Type: `multipart/form-data`.
- Campos form-data:
  - `cedula` (string, requerido)
  - `email` (string, requerido)
  - `password` (string, min 6, requerido)
  - `fullName` (string, opcional)
  - `username` (string, opcional)
  - `phone` (string, opcional)
  - `file` (binary, opcional; jpg/jpeg/png; max 5 MB)
- Respuesta 201: usuario creado (sin `password`).

#### GET /api/users
- Acceso: `admin`.
- Respuesta 200: lista de usuarios.

#### GET /api/users/:id
- Acceso: `admin`.
- Respuesta 200: usuario.

#### PATCH /api/users/:id
- Acceso: `admin`.
- Content-Type: `multipart/form-data` (mismos campos que POST, todos opcionales, incluye `file` para actualizar foto).
- Respuesta 200: usuario actualizado.

#### DELETE /api/users/:id
- Acceso: `admin`.
- Respuesta 200: `{ "message": "User with id <id> deleted" }`.

### Questions
#### POST /api/questions
- Acceso: `admin`.
- Content-Type: `application/json`.
- Body:
```json
{
  "question": "¿Quién es el protagonista de One Piece?",
  "type": "multiple-choice",
  "anime": "One Piece",
  "correctAnswer": "Luffy",
  "options": ["Luffy", "Zoro", "Nami"]
}
```
- Respuesta 201: pregunta creada.

#### GET /api/questions
- Acceso: Autenticado.
- Respuesta 200: lista de preguntas (sin `correctAnswer`).

#### GET /api/questions/:id
- Acceso: Autenticado.
- Respuesta 200: pregunta (sin `correctAnswer`).

#### PATCH /api/questions/:id
- Acceso: `admin`.
- Content-Type: `application/json`.
- Body: parcial del esquema de creación.
- Respuesta 200: pregunta actualizada.

#### DELETE /api/questions/:id
- Acceso: `admin`.
- Respuesta 200: pregunta eliminada.

#### POST /api/questions/:id/answer
- Acceso: Autenticado.
- Content-Type: `application/json`.
- Body:
```json
{ "answer": "Luffy" }
```
- Respuesta 200 (correcto):
```json
{ "correct": true, "message": "¡Acertaste!" }
```
- Respuesta 200 (incorrecto):
```json
{ "correct": false, "message": "Respuesta incorrecta", "correctAnswer": "Luffy" }
```

### Health
#### GET /api/health
- Acceso: Público.
- Respuesta 200:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-22T15:00:00.000Z"
}
```

## Validaciones principales
- Emails válidos, password min 6, strings no vacíos.
- Tamaño de imagen max 5 MB; tipos permitidos jpg/jpeg/png.
- IDs son UUID.

## Errores comunes
| Código | Causa típica |
|--------|--------------|
| 400 | Body inválido o campos faltantes. |
| 401 | Token ausente o inválido. |
| 403 | Rol insuficiente para la operación. |
| 404 | Recurso no encontrado (usuario o pregunta). |
| 500 | Error interno; revisar logs. |

## cURL de referencia
```bash
# Login
curl -X POST https://<host>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mail.com","password":"secret123"}'

# Crear usuario con foto
curl -X POST https://<host>/api/users \
  -F cedula=1234567890 \
  -F email=new@mail.com \
  -F password=secret123 \
  -F fullName="Nuevo Usuario" \
  -F file=@avatar.jpg

# Crear pregunta (admin)
curl -X POST https://<host>/api/questions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question":"¿Quién es el protagonista?","type":"multiple-choice","anime":"Naruto","correctAnswer":"Naruto","options":["Naruto","Sasuke","Sakura"]}'

# Responder pregunta
curl -X POST https://<host>/api/questions/<id>/answer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answer":"Naruto"}'
```
