# POS System — Backend

API REST para un sistema de punto de venta (POS) construida con **NestJS**, **TypeORM** y **PostgreSQL**. Permite gestionar categorías, productos con control de inventario y registrar ventas (transacciones) que descuentan stock de forma atómica.

> Estado: en desarrollo. Categorías y productos tienen CRUD completo; de transacciones solo está implementada la creación (ver [Roadmap](#roadmap)).

## Tabla de contenidos

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [API](#api)
  - [Formato de respuesta](#formato-de-respuesta)
  - [Categorías](#categorías)
  - [Productos](#productos)
  - [Transacciones](#transacciones)
  - [Errores](#errores)
- [Tests](#tests)
- [Roadmap](#roadmap)

## Stack

| Capa          | Tecnología                                  |
| ------------- | ------------------------------------------- |
| Runtime       | Node.js 22+ (ES Modules)                    |
| Framework     | NestJS 12                                   |
| ORM           | TypeORM 1.x                                 |
| Base de datos | PostgreSQL                                  |
| Validación    | class-validator + class-transformer         |
| Tests         | Vitest + Supertest                          |
| Lint / format | oxlint + Prettier                           |
| Gestor        | pnpm                                        |

## Requisitos

- Node.js 22 o superior
- pnpm
- Una base de datos PostgreSQL **con SSL habilitado** (por ejemplo Supabase o Neon). La conexión está configurada con `ssl: true`, así que un Postgres local sin SSL rechazará la conexión.

## Instalación

```bash
git clone https://github.com/HeymerDev/pos-system-backend.git
cd pos-system-backend
pnpm install
```

Crea un archivo `.env` en la raíz (ver siguiente sección) y levanta el servidor:

```bash
pnpm run start:dev
```

La API queda disponible en `http://localhost:4000`.

## Variables de entorno

| Variable       | Requerida | Default | Descripción                                                   |
| -------------- | --------- | ------- | ------------------------------------------------------------- |
| `DATABASE_URL` | Sí        | —       | Cadena de conexión de PostgreSQL                              |
| `PORT`         | No        | `4000`  | Puerto HTTP del servidor                                      |

Ejemplo de `.env`:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/pos_db
PORT=4000
```

> **Importante:** TypeORM está configurado con `synchronize: true`, por lo que crea y modifica las tablas automáticamente a partir de las entidades. Es cómodo en desarrollo, pero **no debe usarse contra una base de datos de producción** (puede borrar columnas y datos).

## Scripts

| Comando                | Descripción                                    |
| ---------------------- | ---------------------------------------------- |
| `pnpm run start:dev`   | Servidor en modo watch                         |
| `pnpm run start:debug` | Servidor en modo debug + watch                 |
| `pnpm run build`       | Compila a `dist/`                              |
| `pnpm run start:prod`  | Ejecuta la versión compilada (`dist/main`)     |
| `pnpm run lint`        | Lint con oxlint                                |
| `pnpm run format`      | Formatea con Prettier                          |
| `pnpm run test`        | Tests unitarios                                |
| `pnpm run test:watch`  | Tests unitarios en modo watch                  |
| `pnpm run test:cov`    | Tests con reporte de cobertura                 |
| `pnpm run test:e2e`    | Tests end-to-end (requieren base de datos)     |

## Estructura del proyecto

```
src/
├── main.ts                      # Bootstrap + ValidationPipe global (whitelist)
├── app.module.ts                # Módulo raíz: Config, TypeORM y módulos de dominio
├── config/
│   └── typeorm.config.ts        # Conexión a PostgreSQL
├── common/
│   ├── decorators/
│   │   └── response-message/    # @ResponseMessage(): mensaje de la respuesta
│   ├── interceptors/
│   │   └── response/            # Envoltorio { status, message, data } + PaginatedResult
│   └── pipes/
│       └── id-validation-pipe/  # Valida que los :id sean enteros
├── categories/                  # CRUD de categorías
├── products/                    # CRUD de productos + filtro y paginación
└── transactions/                # Ventas y detalle de cada venta
test/
└── app.e2e-spec.ts
```

Cada módulo de dominio sigue la estructura estándar de Nest: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/` y `entities/`.

## Modelo de datos

```mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : "tiene"
    PRODUCT ||--o{ TRANSACTION_CONTENT : "se vende en"
    TRANSACTION ||--|{ TRANSACTION_CONTENT : "contiene"

    CATEGORY {
        int id PK
        varchar(55) name
        timestamp deletedAt "borrado lógico"
    }
    PRODUCT {
        int id PK
        varchar(100) name
        varchar(255) image_url "default: default.svg"
        decimal(10_2) price
        int stock "default: 0"
        int categoryId FK
        timestamp deletedAt "borrado lógico"
    }
    TRANSACTION {
        int id PK
        decimal(10_2) total
        timestamp transactionDate "default: now"
    }
    TRANSACTION_CONTENT {
        int id PK
        int quantity
        decimal(10_2) price
        int productId FK
        int transactionId FK
    }
```

## API

Base URL: `http://localhost:4000`

Todas las peticiones con cuerpo usan `Content-Type: application/json`. El `ValidationPipe` global tiene `whitelist: true`, así que cualquier propiedad que no esté definida en el DTO se descarta silenciosamente.

### Formato de respuesta

Todas las respuestas exitosas usan el mismo envoltorio, aplicado por un interceptor global (`ResponseInterceptor`):

```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {}
}
```

| Campo     | Cuándo aparece                                                                 |
| --------- | ------------------------------------------------------------------------------ |
| `status`  | Siempre (`"success"`)                                                          |
| `message` | Solo en endpoints que crean, actualizan, eliminan o registran algo             |
| `data`    | Siempre, excepto en los `DELETE`, que no devuelven contenido                   |
| `total`   | Solo en listados paginados (`GET /products`): total de registros sin paginar   |

Los controllers solo devuelven el resultado del servicio; el mensaje se declara con el decorador `@ResponseMessage('...')` y los listados paginados devuelven un `PaginatedResult`.

Las respuestas de error mantienen el formato de NestJS (ver [Errores](#errores)).

### Categorías

| Método   | Ruta              | Descripción                  |
| -------- | ----------------- | ---------------------------- |
| `POST`   | `/categories`     | Crear categoría              |
| `GET`    | `/categories`     | Listar categorías            |
| `GET`    | `/categories/:id` | Obtener una categoría        |
| `PATCH`  | `/categories/:id` | Actualizar nombre            |
| `DELETE` | `/categories/:id` | Eliminar categoría           |

**Eliminar:** es un borrado lógico (se marca `deletedAt` y deja de aparecer en la API). Si la categoría todavía tiene productos activos responde `409` y no se elimina; hay que mover o eliminar esos productos primero.

**Crear / actualizar**

```json
{ "name": "Bebidas" }
```

| Campo  | Tipo   | Reglas                  |
| ------ | ------ | ----------------------- |
| `name` | string | Requerido, no vacío, único entre las categorías activas (`409` si ya existe) |

**Respuesta de `POST /categories`** (`201`)

```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": { "id": 1, "name": "Bebidas" }
}
```

**Respuesta de `GET /categories`** (`200`)

```json
{
  "status": "success",
  "data": [{ "id": 1, "name": "Bebidas" }]
}
```

### Productos

| Método   | Ruta            | Descripción                                  |
| -------- | --------------- | -------------------------------------------- |
| `POST`   | `/products`     | Crear producto                               |
| `GET`    | `/products`     | Listar productos (filtro + paginación)       |
| `GET`    | `/products/:id` | Obtener un producto con su categoría         |
| `PATCH`  | `/products/:id` | Actualizar producto (campos parciales)       |
| `DELETE` | `/products/:id` | Eliminar producto                            |

**Eliminar:** es un borrado lógico. El producto deja de aparecer en los listados y ya no se puede vender, pero la fila se conserva para no romper el historial de ventas que lo referencia.

**Crear producto**

```json
{
  "name": "Coca-Cola 600ml",
  "image_url": "coca-cola.png",
  "price": 18.5,
  "stock": 40,
  "categoryId": 1
}
```

| Campo        | Tipo   | Reglas                                           |
| ------------ | ------ | ------------------------------------------------ |
| `name`       | string | Requerido                                        |
| `image_url`  | string | Opcional (default `default.svg`)                 |
| `price`      | number | Requerido, positivo, máx. 2 decimales            |
| `stock`      | number | Requerido, entero                                |
| `categoryId` | number | Requerido, entero, la categoría debe existir     |

En `PATCH` todos los campos son opcionales; si se envía `categoryId`, se valida que la categoría exista.

**Listar con filtros** — `GET /products?category_id=1&total=10&offset=0`

| Query param   | Default | Descripción                         |
| ------------- | ------- | ----------------------------------- |
| `category_id` | —       | Filtra por categoría                |
| `total`       | `10`    | Cantidad de resultados (`take`)     |
| `offset`      | `0`     | Resultados a saltar (`skip`)        |

Los productos se ordenan por `id` descendente.

```json
{
  "status": "success",
  "data": [
    {
      "id": 3,
      "name": "Coca-Cola 600ml",
      "image_url": "coca-cola.png",
      "price": "18.50",
      "stock": 40,
      "category": { "id": 1, "name": "Bebidas" }
    }
  ],
  "total": 1
}
```

> `price` llega como string porque PostgreSQL devuelve los `decimal` como texto para no perder precisión.

### Transacciones

| Método   | Ruta                | Estado            |
| -------- | ------------------- | ----------------- |
| `POST`   | `/transactions`     | Implementado      |
| `GET`    | `/transactions`     | Pendiente (stub)  |
| `GET`    | `/transactions/:id` | Pendiente (stub)  |
| `PATCH`  | `/transactions/:id` | Pendiente (stub)  |
| `DELETE` | `/transactions/:id` | Pendiente (stub)  |

**Registrar una venta**

```json
{
  "total": 55.5,
  "contents": [
    { "productId": 3, "quantity": 2, "price": 18.5 },
    { "productId": 7, "quantity": 1, "price": 18.5 }
  ]
}
```

| Campo                  | Tipo   | Reglas                         |
| ---------------------- | ------ | ------------------------------ |
| `total`                | number | Requerido                      |
| `contents`             | array  | Requerido, al menos un ítem    |
| `contents[].productId` | number | Requerido, entero              |
| `contents[].quantity`  | number | Requerido, entero              |
| `contents[].price`     | number | Requerido                      |

La venta se ejecuta dentro de una **transacción de base de datos**: por cada ítem se verifica que el producto exista y tenga stock suficiente, se descuenta el stock y se guarda el detalle. Si algún ítem falla, se revierte todo.

```json
{
  "status": "success",
  "message": "Transaction created successfully"
}
```

### Errores

Los errores siguen el formato estándar de NestJS:

```json
{
  "message": ["Category with ID 99 not found"],
  "error": "Not Found",
  "statusCode": 404
}
```

| Código | Cuándo ocurre                                                              |
| ------ | -------------------------------------------------------------------------- |
| `400`  | Body o query inválidos, `:id` no numérico, stock insuficiente              |
| `404`  | Categoría, producto o producto de una venta no encontrado (o eliminado)    |
| `409`  | Eliminar una categoría con productos activos, o crear/renombrar una categoría con un nombre que ya existe |
| `500`  | Error no controlado                                                        |

## Tests

```bash
# unitarios
pnpm run test

# end-to-end (usa la base de datos de DATABASE_URL)
pnpm run test:e2e

# cobertura
pnpm run test:cov
```

> Los specs actuales son los generados por el CLI de Nest y todavía no mockean los repositorios de TypeORM, por lo que la mayoría falla al resolver dependencias.

## Roadmap

- [ ] Listar y consultar transacciones (`GET /transactions`, `GET /transactions/:id`)
- [ ] Anular una venta y devolver el stock
- [ ] Calcular precio y total de la venta en el servidor
- [ ] Mocks de repositorios en los tests unitarios
- [ ] Migraciones de TypeORM en lugar de `synchronize`
- [ ] Documentación interactiva con Swagger (`@nestjs/swagger`)

## Licencia

UNLICENSED — uso privado.
