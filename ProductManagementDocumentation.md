# Product Management API Documentation

This document provides detailed information about all product management API endpoints used for creating, reading, updating, and deleting products in the OmertaCafe POS system.

**Base URL:** `/api/products`

All endpoints require authentication via API key in the `X-API-Key` header.

Products created through these APIs will be available for the POS Flutter app to download via the sync system using `/api/sync/products/pull`.

---

## Table of Contents

1. [Create Product](#1-create-product)
2. [List Products](#2-list-products)
3. [Get Product by ID](#3-get-product-by-id)
4. [Update Product](#4-update-product)
5. [Delete Product](#5-delete-product)
6. [Get Categories](#6-get-categories)

---

## 1. Create Product

Creates a new product in the system. Supports both regular products and combo products (products that contain other products).

**Endpoint:** `POST /api/products`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | No | Product ID. If not provided, a UUID will be auto-generated |
| `name` | string | Yes | Product name |
| `description` | string | No | Product description |
| `price` | decimal | Yes | Product price (must be a positive number) |
| `category` | string | Yes | Product category (e.g., "Beverages", "Food", "Combos") |
| `image_url` | string | No | URL to product image |
| `is_active` | boolean | No | Whether the product is active (default: `true`) |
| `product_type` | string | No | Product type: `"regular"` or `"combo"` (default: `"regular"`) |
| `combo_items` | array | No | Array of combo items (required if `product_type` is `"combo"`) |
| `created_at` | string (ISO 8601) | No | Creation timestamp (default: current time) |

**Combo Item Object (within combo_items array):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | No | Combo item ID. If not provided, a UUID will be auto-generated |
| `product_id` | string (UUID) | Yes | ID of the constituent product (must exist in database) |
| `quantity` | integer | No | Quantity of this product in the combo (default: `1`) |
| `created_at` | string (ISO 8601) | No | Creation timestamp (default: current time) |

**Request Example (Regular Product):**

```http
POST /api/products
X-API-Key: your-api-key-here
Content-Type: application/json

{
  "name": "Cappuccino",
  "description": "Hot coffee drink with steamed milk",
  "price": 150.00,
  "category": "Beverages",
  "image_url": "https://example.com/images/cappuccino.jpg",
  "is_active": true,
  "product_type": "regular"
}
```

**Request Example (Combo Product):**

```http
POST /api/products
X-API-Key: your-api-key-here
Content-Type: application/json

{
  "name": "Breakfast Combo",
  "description": "Coffee + Sandwich combo",
  "price": 300.00,
  "category": "Combos",
  "product_type": "combo",
  "combo_items": [
    {
      "product_id": "770e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    },
    {
      "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Cappuccino",
    "description": "Hot coffee drink with steamed milk",
    "price": "150.00",
    "category": "Beverages",
    "image_url": "https://example.com/images/cappuccino.jpg",
    "is_active": true,
    "product_type": "regular",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "server_created_at": "2024-01-15T10:30:00.000Z",
    "client_synced_at": null,
    "combo_items": []
  }
}
```

**Response (201 Created - Combo Product):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440002",
    "name": "Breakfast Combo",
    "description": "Coffee + Sandwich combo",
    "price": "300.00",
    "category": "Combos",
    "image_url": null,
    "is_active": true,
    "product_type": "combo",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "server_created_at": "2024-01-15T10:30:00.000Z",
    "client_synced_at": null,
    "combo_items": [
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440003",
        "combo_id": "bb0e8400-e29b-41d4-a716-446655440002",
        "product_id": "770e8400-e29b-41d4-a716-446655440002",
        "quantity": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "product": {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "name": "Espresso",
          "price": "12.75",
          "category": "Beverages"
        }
      },
      {
        "id": "dd0e8400-e29b-41d4-a716-446655440004",
        "combo_id": "bb0e8400-e29b-41d4-a716-446655440002",
        "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
        "quantity": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "product": {
          "id": "ff0e8400-e29b-41d4-a716-446655440010",
          "name": "Sandwich",
          "price": "15.00",
          "category": "Food"
        }
      }
    ]
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Name, price, and category are required"
}
```

**400 Bad Request - Invalid Price:**
```json
{
  "success": false,
  "message": "Price must be a valid positive number"
}
```

**400 Bad Request - Referenced Product Not Found:**
```json
{
  "success": false,
  "message": "Referenced product with ID {product_id} does not exist"
}
```

**409 Conflict - Product ID Already Exists:**
```json
{
  "success": false,
  "message": "Product with ID {id} already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while creating product"
}
```

**Notes:**
- If `combo_items` are provided, the `product_type` will automatically be set to `"combo"` even if not explicitly specified
- All referenced products in `combo_items` must exist in the database before creating the combo
- Product IDs are UUIDs. If not provided, they will be auto-generated
- All operations are transactional - if any part fails, the entire operation is rolled back
- Products created through this API will have `server_created_at` set to the current timestamp

---

## 2. List Products

Retrieves a paginated list of products with optional filtering and search capabilities.

**Endpoint:** `GET /api/products`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category (exact match) |
| `is_active` | boolean/string | No | - | Filter by active status (`true`/`false` or `"1"`/`"0"`) |
| `product_type` | string | No | - | Filter by product type (`"regular"` or `"combo"`) |
| `search` | string | No | - | Search in product name and description (partial match) |
| `page` | integer | No | `1` | Page number for pagination |
| `limit` | integer | No | `50` | Number of items per page |

**Request Example:**

```http
GET /api/products?category=Beverages&is_active=true&page=1&limit=20
X-API-Key: your-api-key-here
```

**Request Example (With Search):**

```http
GET /api/products?search=coffee&product_type=regular&page=1&limit=10
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440001",
        "name": "Cappuccino",
        "description": "Hot coffee drink with steamed milk",
        "price": "150.00",
        "category": "Beverages",
        "image_url": "https://example.com/images/cappuccino.jpg",
        "is_active": true,
        "product_type": "regular",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "server_created_at": "2024-01-15T10:30:00.000Z",
        "client_synced_at": null,
        "combo_items": []
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440002",
        "name": "Breakfast Combo",
        "description": "Coffee + Sandwich combo",
        "price": "300.00",
        "category": "Combos",
        "image_url": null,
        "is_active": true,
        "product_type": "combo",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "server_created_at": "2024-01-15T10:30:00.000Z",
        "client_synced_at": null,
        "combo_items": [
          {
            "id": "cc0e8400-e29b-41d4-a716-446655440003",
            "combo_id": "bb0e8400-e29b-41d4-a716-446655440002",
            "product_id": "770e8400-e29b-41d4-a716-446655440002",
            "quantity": 1,
            "created_at": "2024-01-15T10:30:00.000Z",
            "product": {
              "id": "770e8400-e29b-41d4-a716-446655440002",
              "name": "Espresso",
              "price": "12.75",
              "category": "Beverages"
            }
          }
        ]
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "total_pages": 2
    }
  }
}
```

**Response Fields:**

**Product Object:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID (UUID) |
| `name` | string | Product name |
| `description` | string\|null | Product description |
| `price` | string | Product price (as string) |
| `category` | string | Product category |
| `image_url` | string\|null | URL to product image |
| `is_active` | boolean | Whether the product is active |
| `product_type` | string | Product type: `"regular"` or `"combo"` |
| `created_at` | string (ISO 8601) | Creation timestamp |
| `updated_at` | string (ISO 8601) | Last update timestamp |
| `server_created_at` | string (ISO 8601) | Server creation timestamp |
| `client_synced_at` | string (ISO 8601)\|null | Client sync timestamp (null if created via product management API) |
| `combo_items` | array | Array of combo items (empty for regular products) |

**Pagination Object:**
| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of products matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Number of items per page |
| `total_pages` | integer | Total number of pages |

**Notes:**
- Products are sorted by creation date in descending order (newest first)
- Multiple filters can be combined (e.g., `category=Beverages&is_active=true&search=coffee`)
- Search performs a case-insensitive partial match on product name and description
- The `combo_items` array is included for combo products and shows the constituent products
- For regular products, `combo_items` will be an empty array

---

## 3. Get Product by ID

Retrieves detailed information about a single product by its ID.

**Endpoint:** `GET /api/products/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Product ID |

**Request Example:**

```http
GET /api/products/aa0e8400-e29b-41d4-a716-446655440001
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Cappuccino",
    "description": "Hot coffee drink with steamed milk",
    "price": "150.00",
    "category": "Beverages",
    "image_url": "https://example.com/images/cappuccino.jpg",
    "is_active": true,
    "product_type": "regular",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "server_created_at": "2024-01-15T10:30:00.000Z",
    "client_synced_at": null,
    "combo_items": []
  }
}
```

**Response (200 OK - Combo Product):**

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440002",
    "name": "Breakfast Combo",
    "description": "Coffee + Sandwich combo",
    "price": "300.00",
    "category": "Combos",
    "image_url": null,
    "is_active": true,
    "product_type": "combo",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "server_created_at": "2024-01-15T10:30:00.000Z",
    "client_synced_at": null,
    "combo_items": [
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440003",
        "combo_id": "bb0e8400-e29b-41d4-a716-446655440002",
        "product_id": "770e8400-e29b-41d4-a716-446655440002",
        "quantity": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "product": {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "name": "Espresso",
          "price": "12.75",
          "category": "Beverages"
        }
      },
      {
        "id": "dd0e8400-e29b-41d4-a716-446655440004",
        "combo_id": "bb0e8400-e29b-41d4-a716-446655440002",
        "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
        "quantity": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "product": {
          "id": "ff0e8400-e29b-41d4-a716-446655440010",
          "name": "Sandwich",
          "price": "15.00",
          "category": "Food"
        }
      }
    ]
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching product"
}
```

**Notes:**
- Returns complete product information including combo items if applicable
- Combo items include details of the constituent products

---

## 4. Update Product

Updates an existing product. Supports partial updates - only include fields that need to be changed.

**Endpoint:** `PUT /api/products/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Product ID |

**Request Body:**

All fields are optional. Only include fields that need to be updated.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Product name |
| `description` | string | No | Product description (use `null` to clear) |
| `price` | decimal | No | Product price (must be a positive number) |
| `category` | string | No | Product category |
| `image_url` | string | No | URL to product image (use `null` to clear) |
| `is_active` | boolean | No | Whether the product is active |
| `product_type` | string | No | Product type: `"regular"` or `"combo"` |
| `combo_items` | array | No | Array of combo items (required if updating to combo type) |

**Request Example (Update Name and Price):**

```http
PUT /api/products/aa0e8400-e29b-41d4-a716-446655440001
X-API-Key: your-api-key-here
Content-Type: application/json

{
  "name": "Cappuccino Deluxe",
  "price": 175.00
}
```

**Request Example (Convert to Combo):**

```http
PUT /api/products/aa0e8400-e29b-41d4-a716-446655440001
X-API-Key: your-api-key-here
Content-Type: application/json

{
  "product_type": "combo",
  "combo_items": [
    {
      "product_id": "770e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    },
    {
      "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
      "quantity": 1
    }
  ]
}
```

**Request Example (Update Combo Items):**

```http
PUT /api/products/bb0e8400-e29b-41d4-a716-446655440002
X-API-Key: your-api-key-here
Content-Type: application/json

{
  "combo_items": [
    {
      "product_id": "770e8400-e29b-41d4-a716-446655440002",
      "quantity": 2
    },
    {
      "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
      "quantity": 1
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Cappuccino Deluxe",
    "description": "Hot coffee drink with steamed milk",
    "price": "175.00",
    "category": "Beverages",
    "image_url": "https://example.com/images/cappuccino.jpg",
    "is_active": true,
    "product_type": "regular",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z",
    "server_created_at": "2024-01-15T10:30:00.000Z",
    "client_synced_at": null,
    "combo_items": []
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Price:**
```json
{
  "success": false,
  "message": "Price must be a valid positive number"
}
```

**400 Bad Request - Referenced Product Not Found:**
```json
{
  "success": false,
  "message": "Referenced product with ID {product_id} does not exist"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while updating product"
}
```

**Notes:**
- Partial updates are supported - only include fields that need to be changed
- If `combo_items` is provided, existing combo items will be replaced entirely
- If updating `product_type` from `"combo"` to `"regular"`, all combo items will be removed
- If `combo_items` are provided, the `product_type` will automatically be set to `"combo"` even if not explicitly specified
- All referenced products in `combo_items` must exist in the database
- The `updated_at` timestamp is automatically set to the current time
- All operations are transactional - if any part fails, the entire operation is rolled back

---

## 5. Delete Product

Soft deletes a product by setting `is_active` to `false`. The product data is preserved for historical records and transaction history.

**Endpoint:** `DELETE /api/products/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Product ID |

**Request Example:**

```http
DELETE /api/products/aa0e8400-e29b-41d4-a716-446655440001
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while deleting product"
}
```

**Notes:**
- This is a **soft delete** - the product is not removed from the database
- The product's `is_active` field is set to `0` (false)
- The `updated_at` timestamp is updated
- Deleted products will not appear in normal product listings (unless `is_active=false` filter is used)
- Historical transaction data referencing this product will remain intact
- To restore a deleted product, use the Update Product endpoint to set `is_active: true`
- Combo items associated with the product are not deleted, but the product will be inactive

---

## 6. Get Categories

Retrieves all unique categories from active products in the system. This endpoint is useful for populating category dropdowns or validating category names when creating or updating products.

**Endpoint:** `GET /api/products/categories`

**Request Example:**

```http
GET /api/products/categories
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "categories": [
      "Beverages",
      "Combos",
      "Food",
      "Snacks"
    ],
    "count": 4
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data` | object | Response data object |
| `data.categories` | array | Array of unique category names (sorted alphabetically) |
| `data.count` | integer | Total number of unique categories |

**Error Responses:**

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching categories"
}
```

**Notes:**
- Only categories from **active products** (`is_active = 1`) are included
- Categories are sorted alphabetically
- Empty, null, or undefined categories are filtered out
- This endpoint returns all available categories that can be used when creating or updating products
- The categories list is dynamically generated based on existing products in the database

---

## General Notes

### Authentication
All endpoints require authentication via the `X-API-Key` header with a valid API key.

### Product Types

**Regular Products:**
- Standard products with a single price
- No constituent products
- `combo_items` array will be empty

**Combo Products:**
- Products that contain other products
- Price represents the combo price (may differ from sum of constituent products)
- Must have at least one item in `combo_items` array
- All referenced products in `combo_items` must exist in the database
- Combo items can reference other combo products (nested combos are supported)

### Data Synchronization

Products created or updated through the product management API will be available for the POS Flutter app to download via:
- `GET /api/sync/products/pull` - Download all products
- `GET /api/sync/products/pull?since=YYYY-MM-DDTHH:mm:ss.sssZ` - Download products updated after a specific timestamp

The POS app will receive products in the same format, ensuring compatibility between systems.

### Timestamps

- `created_at`: Original creation timestamp (preserved on updates)
- `updated_at`: Last modification timestamp (automatically updated on changes)
- `server_created_at`: Timestamp when product was created via product management API (null for products synced from POS)
- `client_synced_at`: Timestamp when product was last synced from POS app (null for products created via product management API)

### Error Handling

All endpoints return consistent error responses:
- `400 Bad Request`: Invalid input data or validation errors
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate ID)
- `500 Internal Server Error`: Server-side errors

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Transaction Safety

All create, update, and delete operations are wrapped in database transactions. If any part of an operation fails, the entire operation is rolled back to maintain data consistency.

---

## Example Workflows

### Creating a New Product Catalog

1. **Create Regular Products First:**
   ```http
   POST /api/products
   {
     "name": "Espresso",
     "price": 100.00,
     "category": "Beverages"
   }
   ```

2. **Create Combo Products:**
   ```http
   POST /api/products
   {
     "name": "Breakfast Combo",
     "price": 250.00,
     "category": "Combos",
     "product_type": "combo",
     "combo_items": [
       { "product_id": "<espresso-id>", "quantity": 1 },
       { "product_id": "<sandwich-id>", "quantity": 1 }
     ]
   }
   ```

3. **List Products to Verify:**
   ```http
   GET /api/products
   ```

### Updating Product Pricing

```http
PUT /api/products/{product-id}
{
  "price": 120.00
}
```

### Managing Product Availability

**Deactivate Product:**
```http
PUT /api/products/{product-id}
{
  "is_active": false
}
```

**Reactivate Product:**
```http
PUT /api/products/{product-id}
{
  "is_active": true
}
```

**Permanently Remove (Soft Delete):**
```http
DELETE /api/products/{product-id}
```

---

## Integration with POS App

Products created through these APIs are immediately available for the POS Flutter app:

1. **POS App Syncs Products:**
   ```http
   GET /api/sync/products/pull
   ```

2. **POS App Receives Products:**
   - All products (active and inactive)
   - Combo products with their combo items
   - Proper formatting compatible with POS app structure

3. **POS App Can Filter:**
   - Use `is_active` field to show/hide products
   - Filter by category for menu organization
   - Handle combo products appropriately

---

**Last Updated:** 2024-01-15

