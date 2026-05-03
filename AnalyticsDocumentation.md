# Analytics API Documentation

This document provides detailed information about all analytics API endpoints used for reporting and data analysis in the OmertaCafe POS system.

**Base URL:** `/api/analytics`

All endpoints require authentication via API key in the `X-API-Key` header.

---

## Table of Contents

1. [Get Transactions by Period](#1-get-transactions-by-period)
2. [Get Transactions by Date Range](#2-get-transactions-by-date-range)
3. [Get Statistics](#3-get-statistics)

---

## 1. Get Transactions by Period

Retrieves transactions filtered by a specific time period with detailed transaction information and summary statistics.

**Endpoint:** `GET /api/analytics/transactions/filter`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `today` | Time period filter. Accepts: `today`, `7days`, `30days`, or a specific date in `YYYY-MM-DD` format |

**Request Example:**

```http
GET /api/analytics/transactions/filter?period=7days
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "transaction_number": "TXN-2024-001",
        "status": "completed",
        "total_amount": "50.50",
        "payment_method": "cash",
        "created_at": "2024-01-15T10:30:00.000Z",
        "items": [
          {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "quantity": 2,
            "product_name": "Espresso",
            "unit_price": "12.75",
            "subtotal": "25.50",
            "product": {
              "id": "770e8400-e29b-41d4-a716-446655440002",
              "name": "Espresso",
              "price": "12.75",
              "category": "Beverages",
              "product_type": "regular"
            }
          },
          {
            "id": "bb0e8400-e29b-41d4-a716-446655440006",
            "quantity": 1,
            "product_name": "Breakfast Combo",
            "unit_price": "25.00",
            "subtotal": "25.00",
            "product": {
              "id": "cc0e8400-e29b-41d4-a716-446655440007",
              "name": "Breakfast Combo",
              "price": "25.00",
              "category": "Combos",
              "product_type": "combo",
              "combo_items": [
                {
                  "id": "dd0e8400-e29b-41d4-a716-446655440008",
                  "product_id": "770e8400-e29b-41d4-a716-446655440002",
                  "quantity": 1,
                  "product": {
                    "id": "770e8400-e29b-41d4-a716-446655440002",
                    "name": "Espresso",
                    "price": "12.75",
                    "category": "Beverages"
                  }
                },
                {
                  "id": "ee0e8400-e29b-41d4-a716-446655440009",
                  "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
                  "quantity": 1,
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
        ]
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "transaction_number": "TXN-2024-002",
        "status": "completed",
        "total_amount": "18.00",
        "payment_method": "card",
        "created_at": "2024-01-15T11:45:00.000Z",
        "items": [
          {
            "id": "990e8400-e29b-41d4-a716-446655440004",
            "quantity": 1,
            "product_name": "Cappuccino",
            "unit_price": "18.00",
            "subtotal": "18.00",
            "product": {
              "id": "aa0e8400-e29b-41d4-a716-446655440005",
              "name": "Cappuccino",
              "price": "18.00",
              "category": "Beverages",
              "product_type": "regular"
            }
          }
        ]
      }
    ],
    "summary": {
      "total_orders": 2,
      "total_amount": 68.5,
      "period": "7days",
      "date_range": {
        "start": "2024-01-08T19:00:00.000Z",
        "end": "2024-01-15T18:59:59.999Z"
      }
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid period format:
```json
{
  "success": false,
  "message": "Invalid period. Use: today, 7days, 30days, or specific date (YYYY-MM-DD)"
}
```

**401 Unauthorized** - Missing or invalid API key:
```json
{
  "success": false,
  "error": "API key required",
  "code": "MISSING_API_KEY"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching transactions"
}
```

**Response Fields:**

**Transaction Object:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Transaction ID (UUID) |
| `transaction_number` | string | Unique transaction identifier |
| `status` | string | Transaction status (always "completed" for analytics) |
| `total_amount` | string | Total transaction amount |
| `payment_method` | string | Payment method used (e.g., "cash", "card") |
| `created_at` | string | Transaction creation timestamp (ISO 8601) |
| `items` | array | Array of transaction items |

**Transaction Item Object:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Transaction item ID (UUID) |
| `quantity` | integer | Quantity of the product |
| `product_name` | string | Product name at time of transaction |
| `unit_price` | string | Unit price at time of transaction |
| `subtotal` | string | Subtotal for this item (quantity × unit_price) |
| `product` | object\|null | Product details (null if product was deleted) |

**Product Object (within Transaction Item):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID (UUID) |
| `name` | string | Current product name |
| `price` | string | Current product price |
| `category` | string | Product category |
| `product_type` | string | Product type: `"regular"` or `"combo"` |
| `combo_items` | array\|undefined | Only present if `product_type: "combo"`. Contains array of constituent products |

**Combo Item Object (within Product.combo_items):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Combo item ID (UUID) |
| `product_id` | string | ID of the constituent product |
| `quantity` | integer | Quantity of this product in the combo |
| `product` | object\|null | Constituent product details (null if product was deleted) |

**Summary Object:**
| Field | Type | Description |
|-------|------|-------------|
| `total_orders` | integer | Total number of transactions in the period |
| `total_amount` | float | Total sales amount for all transactions |
| `period` | string | The period filter used (for period endpoint) |
| `from_date` | string | Start date (for date range endpoint) |
| `to_date` | string | End date (for date range endpoint) |
| `date_range` | object | Date range with start and end timestamps |

**Notes:**
- The endpoint uses Pakistan timezone (UTC+5) for date calculations
- When using a specific date format (`YYYY-MM-DD`), it returns transactions for that entire day
- Only completed transactions are included in the results
- Transactions are sorted by creation date in descending order (newest first)
- Each transaction includes full details of transaction items with product information
- If a product has been deleted, the `product` field in items will be `null`, but `product_name` and `unit_price` are still available from the transaction item
- **Combo Products**: If a transaction item is a combo product (`product_type: "combo"`), the `product` object will include a `combo_items` array containing the breakdown of constituent products with their quantities

---

## 2. Get Transactions by Date Range

Retrieves transactions within a custom date range with detailed transaction information and summary statistics.

**Endpoint:** `GET /api/analytics/transactions/date-range`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from_date` | string | Yes | Start date in `YYYY-MM-DD` format |
| `to_date` | string | Yes | End date in `YYYY-MM-DD` format |

**Request Example:**

```http
GET /api/analytics/transactions/date-range?from_date=2024-01-01&to_date=2024-01-31
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "transaction_number": "TXN-2024-001",
        "status": "completed",
        "total_amount": "55.50",
        "payment_method": "cash",
        "created_at": "2024-01-15T10:30:00.000Z",
        "items": [
          {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "quantity": 2,
            "product_name": "Espresso",
            "unit_price": "12.75",
            "subtotal": "25.50",
            "product": {
              "id": "770e8400-e29b-41d4-a716-446655440002",
              "name": "Espresso",
              "price": "12.75",
              "category": "Beverages",
              "product_type": "regular"
            }
          },
          {
            "id": "bb0e8400-e29b-41d4-a716-446655440006",
            "quantity": 1,
            "product_name": "Lunch Combo",
            "unit_price": "30.00",
            "subtotal": "30.00",
            "product": {
              "id": "cc0e8400-e29b-41d4-a716-446655440007",
              "name": "Lunch Combo",
              "price": "30.00",
              "category": "Combos",
              "product_type": "combo",
              "combo_items": [
                {
                  "id": "dd0e8400-e29b-41d4-a716-446655440008",
                  "product_id": "aa0e8400-e29b-41d4-a716-446655440005",
                  "quantity": 1,
                  "product": {
                    "id": "aa0e8400-e29b-41d4-a716-446655440005",
                    "name": "Cappuccino",
                    "price": "18.00",
                    "category": "Beverages"
                  }
                },
                {
                  "id": "ee0e8400-e29b-41d4-a716-446655440009",
                  "product_id": "ff0e8400-e29b-41d4-a716-446655440010",
                  "quantity": 1,
                  "product": {
                    "id": "ff0e8400-e29b-41d4-a716-446655440010",
                    "name": "Pasta",
                    "price": "15.00",
                    "category": "Food"
                  }
                }
              ]
            }
          }
        ]
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "transaction_number": "TXN-2024-002",
        "status": "completed",
        "total_amount": "18.00",
        "payment_method": "card",
        "created_at": "2024-01-20T11:45:00.000Z",
        "items": [
          {
            "id": "990e8400-e29b-41d4-a716-446655440004",
            "quantity": 1,
            "product_name": "Cappuccino",
            "unit_price": "18.00",
            "subtotal": "18.00",
            "product": {
              "id": "aa0e8400-e29b-41d4-a716-446655440005",
              "name": "Cappuccino",
              "price": "18.00",
              "category": "Beverages",
              "product_type": "regular"
            }
          }
        ]
      }
    ],
    "summary": {
      "total_orders": 2,
      "total_amount": 73.5,
      "from_date": "2024-01-01",
      "to_date": "2024-01-31",
      "date_range": {
        "start": "2023-12-31T19:00:00.000Z",
        "end": "2024-01-31T18:59:59.999Z"
      }
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing required parameters:
```json
{
  "success": false,
  "message": "Both from_date and to_date are required (format: YYYY-MM-DD)"
}
```

**400 Bad Request** - Invalid date format:
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD format for both from_date and to_date"
}
```

**400 Bad Request** - Invalid date range:
```json
{
  "success": false,
  "message": "from_date cannot be after to_date"
}
```

**401 Unauthorized** - Missing or invalid API key:
```json
{
  "success": false,
  "error": "API key required",
  "code": "MISSING_API_KEY"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching transactions"
}
```

**Notes:**
- The endpoint uses Pakistan timezone (UTC+5) for date calculations
- The date range is inclusive (includes both start and end dates)
- Only completed transactions are included in the results
- Transactions are sorted by creation date in descending order (newest first)
- Each transaction includes full details of transaction items with product information
- **Combo Products**: If a transaction item is a combo product (`product_type: "combo"`), the `product` object will include a `combo_items` array containing the breakdown of constituent products with their quantities
- Response structure follows the same format as the "Get Transactions by Period" endpoint (see above for field descriptions)

---

## 3. Get Statistics

Retrieves general statistics including today's orders, today's sales, and total orders across all time.

**Endpoint:** `GET /api/analytics/stats`

**Request Example:**

```http
GET /api/analytics/stats
X-API-Key: your-api-key-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "today_orders": 5,
      "today_sales": 64.95,
      "total_orders": 127
    }
  }
}
```

**Error Responses:**

**401 Unauthorized** - Missing or invalid API key:
```json
{
  "success": false,
  "error": "API key required",
  "code": "MISSING_API_KEY"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching statistics"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `today_orders` | integer | Number of completed transactions created today |
| `today_sales` | float | Total sales amount (in currency) for completed transactions created today |
| `total_orders` | integer | Total number of completed transactions across all time |

**Notes:**
- Statistics are calculated based on completed transactions only
- "Today" is calculated based on Pakistan timezone (UTC+5)
- If there are no transactions, all values will be 0
- Sales amounts are returned as floating-point numbers

---

## Authentication

All endpoints require authentication using an API key in the `X-API-Key` header:

```http
X-API-Key: your-api-key-here
```

The API key must match the value configured in the server's `API_KEY` environment variable.

---

## Error Response Format

All error responses follow this general format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

For authentication errors, an additional `code` field is included:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Date and Time Handling

- All timestamps are returned in ISO 8601 format (UTC)
- Date calculations use Pakistan timezone (UTC+5)
- Date parameters should be provided in `YYYY-MM-DD` format
- Time ranges are inclusive of both start and end dates
- "Today" refers to the current day in Pakistan timezone

---

## Transaction Status

Only transactions with `status: "completed"` are included in analytics results. Transactions with other statuses (e.g., "pending", "cancelled") are excluded from all analytics endpoints.

---

## Product Information

Transaction items include product information when available:
- If the product still exists in the database, the `product` object contains full product details including `product_type` (either `"regular"` or `"combo"`)
- If the product has been deleted, the `product` field will be `null`, but historical data (`product_name`, `unit_price`, `subtotal`) is still available from the transaction item record

### Combo Products

When a transaction item is a combo product (`product_type: "combo"`), the response includes additional information:

```json
{
  "product": {
    "id": "combo-product-id",
    "name": "Breakfast Combo",
    "price": "25.00",
    "category": "Combos",
    "product_type": "combo",
    "combo_items": [
      {
        "id": "combo-item-id-1",
        "product_id": "product-id-1",
        "quantity": 1,
        "product": {
          "id": "product-id-1",
          "name": "Coffee",
          "price": "10.00",
          "category": "Beverages"
        }
      },
      {
        "id": "combo-item-id-2",
        "product_id": "product-id-2",
        "quantity": 1,
        "product": {
          "id": "product-id-2",
          "name": "Sandwich",
          "price": "15.00",
          "category": "Food"
        }
      }
    ]
  }
}
```

The `combo_items` array shows:
- Each constituent product in the combo
- The quantity of each product included in the combo
- Full product details for each constituent product (if the product still exists)

---

## Rate Limiting

All endpoints are subject to rate limiting:
- **Window:** 15 minutes
- **Max Requests:** 100 requests per window per IP address

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum number of requests allowed
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

---

## Support

For issues or questions regarding the Analytics API, please contact the development team or refer to the main API documentation.

