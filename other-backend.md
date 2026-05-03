# Statistics & Analytics API Documentation

This document provides detailed information about all statistics and analytics API endpoints used for reporting and data analysis in the House of Ramen POS system.

**Base URL:** `/api`

All endpoints require authentication via Bearer token in the Authorization header.

---

## Table of Contents

1. [Get Orders by Period](#1-get-orders-by-period)
2. [Get Orders by Date Range](#2-get-orders-by-date-range)
3. [Get Current User Statistics](#3-get-current-user-statistics)
4. [Get User Activity](#4-get-user-activity)

---

## 1. Get Orders by Period

Retrieves orders filtered by a specific time period with detailed order information and summary statistics.

**Endpoint:** `GET /api/orders/filter`

**Required Role:** Admin

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `today` | Time period filter. Accepts: `today`, `7days`, `30days`, or a specific date in `YYYY-MM-DD` format |

**Request Example:**

```http
GET /api/orders/filter?period=7days
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "total_amount": "25.50",
        "payment_method": "cash",
        "created_at": "2024-01-15T10:30:00.000Z",
        "order_items": [
          {
            "id": 1,
            "quantity": 2,
            "menu_item": {
              "id": 5,
              "name": "Tonkotsu Ramen",
              "price": "12.75",
              "cost_price": "5.00"
            }
          }
        ],
        "cashier": {
          "id": 2,
          "username": "cashier1"
        }
      },
      {
        "id": 2,
        "order_number": "660e8400-e29b-41d4-a716-446655440001",
        "status": "completed",
        "total_amount": "18.00",
        "payment_method": "card",
        "created_at": "2024-01-15T11:45:00.000Z",
        "order_items": [
          {
            "id": 2,
            "quantity": 1,
            "menu_item": {
              "id": 3,
              "name": "Miso Ramen",
              "price": "18.00",
              "cost_price": "7.50"
            }
          }
        ],
        "cashier": {
          "id": 2,
          "username": "cashier1"
        }
      }
    ],
    "summary": {
      "total_orders": 2,
      "total_amount": 43.5,
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

**401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching orders"
}
```

**Notes:**
- The endpoint uses Pakistan timezone (UTC+5) for date calculations
- When using a specific date format (`YYYY-MM-DD`), it returns orders for that entire day
- Orders are sorted by creation date in descending order (newest first)
- Each order includes full details of order items with menu item information and cashier details

---

## 2. Get Orders by Date Range

Retrieves orders within a custom date range with detailed order information and summary statistics.

**Endpoint:** `GET /api/orders/date-range`

**Required Role:** Manager

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from_date` | string | Yes | Start date in `YYYY-MM-DD` format |
| `to_date` | string | Yes | End date in `YYYY-MM-DD` format |

**Request Example:**

```http
GET /api/orders/date-range?from_date=2024-01-01&to_date=2024-01-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "total_amount": "25.50",
        "payment_method": "cash",
        "created_at": "2024-01-15T10:30:00.000Z",
        "customer_name": "John Doe",
        "order_type": "dine-in",
        "order_items": [
          {
            "id": 1,
            "quantity": 2,
            "menu_item": {
              "id": 5,
              "name": "Tonkotsu Ramen",
              "price": "12.75",
              "cost_price": "5.00"
            }
          }
        ],
        "cashier": {
          "id": 2,
          "username": "cashier1"
        }
      },
      {
        "id": 2,
        "order_number": "660e8400-e29b-41d4-a716-446655440001",
        "status": "completed",
        "total_amount": "18.00",
        "payment_method": "card",
        "created_at": "2024-01-20T11:45:00.000Z",
        "customer_name": "Jane Smith",
        "order_type": "takeout",
        "order_items": [
          {
            "id": 2,
            "quantity": 1,
            "menu_item": {
              "id": 3,
              "name": "Miso Ramen",
              "price": "18.00",
              "cost_price": "7.50"
            }
          }
        ],
        "cashier": {
          "id": 3,
          "username": "cashier2"
        }
      }
    ],
    "summary": {
      "total_orders": 2,
      "total_amount": 43.5,
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

**401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "success": false,
  "message": "Access denied. Manager role required."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching orders"
}
```

**Notes:**
- Cashiers can only see their own orders when using this endpoint
- Managers can see all orders within the date range
- The endpoint uses Pakistan timezone (UTC+5) for date calculations
- The date range is inclusive (includes both start and end dates)
- Orders are sorted by creation date in descending order (newest first)
- Each order includes customer name and order type in addition to other details

---

## 3. Get Current User Statistics

Retrieves statistics for the currently authenticated user, including today's orders, today's sales, and total orders.

**Endpoint:** `GET /api/users/stats/my-stats`

**Required Role:** Cashier

**Request Example:**

```http
GET /api/users/stats/my-stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

**401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "success": false,
  "message": "Access denied. Cashier role required."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching user statistics"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `today_orders` | integer | Number of orders created by the user today |
| `today_sales` | float | Total sales amount (in currency) for orders created by the user today |
| `total_orders` | integer | Total number of orders created by the user across all time |

**Notes:**
- Statistics are calculated based on the user's own orders (cashier_id matches the authenticated user)
- "Today" is calculated based on the server's timezone (Pakistan time, UTC+5)
- If the user has no orders, all values will be 0
- Sales amounts are returned as floating-point numbers

---

## 4. Get User Activity

Retrieves detailed activity logs and statistics for a specific user over a specified time period.

**Endpoint:** `GET /api/users/:id/activity`

**Required Role:** Manager

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID to retrieve activity for |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `days` | integer | No | `30` | Number of days to include in the activity report |

**Request Example:**

```http
GET /api/users/2/activity?days=7
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "username": "cashier1",
      "role": "cashier",
      "is_active": true,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    },
    "activity": {
      "period": "7 days",
      "orders": [
        {
          "id": 15,
          "order_number": "550e8400-e29b-41d4-a716-446655440000",
          "total_amount": "25.50",
          "status": "completed",
          "created_at": "2024-01-14T10:30:00.000Z"
        },
        {
          "id": 16,
          "order_number": "660e8400-e29b-41d4-a716-446655440001",
          "total_amount": "18.00",
          "status": "completed",
          "created_at": "2024-01-13T11:45:00.000Z"
        },
        {
          "id": 17,
          "order_number": "770e8400-e29b-41d4-a716-446655440002",
          "total_amount": "32.75",
          "status": "completed",
          "created_at": "2024-01-12T14:20:00.000Z"
        }
      ],
      "statistics": {
        "total_orders": 23,
        "total_sales": 298.75,
        "avg_order_value": 12.99
      }
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid user ID:
```json
{
  "success": false,
  "message": "Invalid user ID"
}
```

**401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "success": false,
  "message": "Access denied. Manager role required."
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while fetching user activity"
}
```

**Response Fields:**

**User Object:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `username` | string | Username |
| `role` | string | User role (cashier, manager, admin) |
| `is_active` | boolean | Whether the user account is active |
| `created_at` | string | Account creation timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |

**Activity Object:**
| Field | Type | Description |
|-------|------|-------------|
| `period` | string | Human-readable period description (e.g., "7 days", "30 days") |
| `orders` | array | List of orders created by the user in the specified period (limited to 100 most recent) |
| `statistics.total_orders` | integer | Total number of orders in the period |
| `statistics.total_sales` | float | Total sales amount in the period |
| `statistics.avg_order_value` | float | Average order value (total_sales / total_orders) |

**Order Object (in orders array):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Order ID |
| `order_number` | string | Unique order identifier (UUID) |
| `total_amount` | string | Order total amount |
| `status` | string | Order status (completed, cancelled) |
| `created_at` | string | Order creation timestamp (ISO 8601) |

**Notes:**
- The orders list is limited to the 100 most recent orders within the specified period
- Orders are sorted by creation date in descending order (newest first)
- Statistics are calculated for all orders in the period, not just the returned list
- The period is calculated from the current date going back the specified number of days
- If no orders exist in the period, the orders array will be empty and statistics will show 0 values
- Average order value is calculated as total_sales divided by total_orders

---

## Authentication

All endpoints require authentication using a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through the authentication endpoint (`POST /api/auth/login`).

---

## Error Response Format

All error responses follow this general format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

Additional error details may be included in development environments.

---

## Date and Time Handling

- All timestamps are returned in ISO 8601 format (UTC)
- Date calculations use Pakistan timezone (UTC+5)
- Date parameters should be provided in `YYYY-MM-DD` format
- Time ranges are inclusive of both start and end dates

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

## Role-Based Access Control

| Endpoint | Cashier | Manager | Admin |
|----------|---------|---------|-------|
| Get Orders by Period | ❌ | ❌ | ✅ |
| Get Orders by Date Range | ✅* | ✅ | ✅ |
| Get Current User Statistics | ✅ | ✅ | ✅ |
| Get User Activity | ❌ | ✅ | ✅ |

*Cashiers can only see their own orders when using the date range endpoint.

---

## Support

For issues or questions regarding the Statistics & Analytics API, please contact the development team or refer to the main API documentation.

