# 📚 Documentación de la API - Sistema de Quiz de Anime

Esta documentación detalla los endpoints disponibles, los formatos de solicitud/respuesta y los requisitos de autenticación para el frontend.

## 🔐 Autenticación y Seguridad

El sistema utiliza **JWT (JSON Web Tokens)**.
- **Header requerido:** `Authorization: Bearer <token>`
- **Roles disponibles:**
  - `admin`: Acceso total (crear/editar/borrar preguntas y usuarios).
  - `user`: Acceso básico (responder preguntas, ver perfil).
  - `super-user`: (Reservado para uso futuro).

---

## 👤 Usuarios (Auth & Users)

### 1. Registrar Usuario
Crea una cuenta nueva. Soporta subida de imagen de perfil.

- **Método:** `POST`
- **URL:** `/api/auth/register`
- **Content-Type:** `multipart/form-data` (si sube foto) o `application/json`
- **Acceso:** Público

**Body (Form-Data):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `cedula` | String | ✅ Sí | Identificación única. |
| `email` | String | ✅ Sí | Correo electrónico único. |
| `password` | String | ✅ Sí | Mínimo 6 caracteres. |
| `fullName` | String | ❌ No | Nombre completo. |
| `username` | String | ❌ No | Nombre de usuario. |
| `phone` | String | ❌ No | Número de teléfono. |
| `file` | File | ❌ No | Imagen (jpg, jpeg, png). Max 5MB. |

**Respuesta Exitosa (201 Created):**
```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "cedula": "1234567890",
  "fullName": "Juan Perez",
  "isActive": true,
  "roles": ["user"],
  "photo_url": "https://i.ibb.co/...",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Iniciar Sesión
Obtiene el token de acceso.

- **Método:** `POST`
- **URL:** `/api/auth/login`
- **Content-Type:** `application/json`
- **Acceso:** Público

**Body:**
```json
{
  "email": "admin@binkscrew.com",
  "password": "123456"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": "uuid-del-usuario",
  "email": "admin@binkscrew.com",
  "fullName": "Administrador",
  "roles": ["admin", "super-user", "user"],
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## ❓ Preguntas (Quiz System)

### 1. Obtener Todas las Preguntas
Lista todas las preguntas disponibles para el quiz.

- **Método:** `GET`
- **URL:** `/api/questions`
- **Acceso:** Usuario Autenticado (`user`, `admin`)

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": "uuid-pregunta-1",
    "question": "¿Quién es el protagonista de One Piece?",
    "type": "multiple-choice",
    "anime": "One Piece",
    "options": ["Luffy", "Zoro", "Nami"],
    "createdAt": "2025-12-19T14:00:00.000Z"
  },
  {
    "id": "uuid-pregunta-2",
    "question": "¿Naruto se convierte en Hokage?",
    "type": "true-false",
    "anime": "Naruto",
    "options": ["Verdadero", "Falso"],
    "createdAt": "2025-12-19T14:05:00.000Z"
  }
]
```
*Nota: El campo `correctAnswer` no se envía en este listado para evitar trampas.*

### 2. Responder una Pregunta
Envía la respuesta del usuario para verificar si es correcta.

- **Método:** `POST`
- **URL:** `/api/questions/:id/answer`
- **Acceso:** Usuario Autenticado (`user`, `admin`)

**Body:**
```json
{
  "answer": "Luffy"
}
```

**Respuesta (Acierto):**
```json
{
  "correct": true,
  "message": "¡Acertaste!"
}
```

**Respuesta (Fallo):**
```json
{
  "correct": false,
  "message": "Respuesta incorrecta",
  "correctAnswer": "Luffy" 
}
```

### 3. Crear Pregunta (Solo Admin)
Agrega una nueva pregunta al banco de preguntas.

- **Método:** `POST`
- **URL:** `/api/questions`
- **Acceso:** Solo `admin`

**Body:**
```json
{
  "question": "¿Cuál es el Quirk de Deku?",
  "type": "multiple-choice", 
  "anime": "My Hero Academia",
  "correctAnswer": "One For All",
  "options": ["Explosión", "One For All", "Mitad Frio Mitad Caliente"]
}
```
*Tipos sugeridos: `multiple-choice`, `true-false`, `open`.*

### 4. Editar Pregunta (Solo Admin)
- **Método:** `PATCH`
- **URL:** `/api/questions/:id`
- **Acceso:** Solo `admin`
- **Body:** Igual al de crear, pero todos los campos son opcionales.

### 5. Eliminar Pregunta (Solo Admin)
- **Método:** `DELETE`
- **URL:** `/api/questions/:id`
- **Acceso:** Solo `admin`

---

## 🛠️ Gestión de Usuarios (Solo Admin)

### 1. Listar Usuarios
- **Método:** `GET`
- **URL:** `/api/users`
- **Acceso:** Solo `admin`

### 2. Editar Usuario
Permite a un administrador cambiar datos de un usuario (incluyendo roles).

- **Método:** `PATCH`
- **URL:** `/api/users/:id`
- **Content-Type:** `multipart/form-data` o `application/json`
- **Acceso:** Solo `admin`

---

## 🏥 Health Check
Verifica si el servidor y la base de datos están funcionando.

- **Método:** `GET`
- **URL:** `/api/health`
- **Acceso:** Público

**Respuesta:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-19T15:00:00.000Z"
}
```

---

## ⚠️ Códigos de Error Comunes

| Código | Significado | Causa Probable |
|--------|-------------|----------------|
| `400` | Bad Request | Faltan campos, email inválido, contraseña muy corta. |
| `401` | Unauthorized | No enviaste el token o el token expiró. |
| `403` | Forbidden | Tienes token, pero no tienes el rol necesario (ej. usuario intentando borrar pregunta). |
| `404` | Not Found | El ID (usuario o pregunta) no existe. |
| `500` | Internal Server Error | Error en el servidor (revisar logs). |
