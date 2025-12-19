# Instrucciones de GitHub Copilot

## Comandos de NestJS
- Utiliza siempre los comandos más actuales de la CLI de NestJS para generar componentes, módulos y recursos.
- Ejemplo: Usa `nest g resource [nombre]` para generar un conjunto completo de archivos CRUD cuando sea apropiado.
- Usa `nest g module [nombre]`, `nest g controller [nombre]`, y `nest g service [nombre]` para componentes individuales.

## Buenas Prácticas
- Sigue las guías de estilo oficiales de NestJS y TypeScript.
- Implementa DTOs (Data Transfer Objects) para la validación de datos entrantes, utilizando `class-validator` y `class-transformer`.
- Usa Inyección de Dependencias (Dependency Injection) para gestionar las dependencias entre clases.
- Asegura el tipado estricto en TypeScript; evita el uso de `any`.
- Maneja los errores utilizando Exception Filters y respuestas HTTP estándar.

## Modularización
- Organiza el código en Módulos (Modules) cohesivos y desacoplados.
- Cada característica principal debe tener su propio directorio y módulo (Feature Modules).
- Evita la lógica de negocio en los controladores; delega siempre a los servicios.
- Utiliza módulos compartidos (Shared Modules) para código reutilizable.
