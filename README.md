# NewPOS Sync Backend

Node.js backend API for syncing POS data to MySQL database.

## Features

- **Idempotent sync operations** - Safe to retry without creating duplicates
- **Batch processing** - Efficient sync of multiple records
- **Bidirectional sync** - Upload transactions/products, download product updates
- **Race condition protection** - Database transactions with row-level locking

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MySQL Database

```bash
# Connect to MySQL and run the migration
mysql -u root -p < migrations/001_initial.sql
```

### 3. Configure Environment

```bash
# Copy example config
copy env.example.txt .env

# Edit .env with your settings:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - API_KEY (generate a secure key)
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| POST | `/api/sync/transaction` | Sync single transaction |
| POST | `/api/sync/transactions/batch` | Sync multiple transactions |
| POST | `/api/sync/product` | Sync single product |
| POST | `/api/sync/products/batch` | Sync multiple products |
| GET | `/api/sync/products/pull?since={timestamp}` | Download product updates |

## Authentication

All `/api/*` endpoints require the `X-API-Key` header:

```
X-API-Key: your-api-key-here
```

## Flutter Client Configuration

In your Flutter app, configure the sync service:

```dart
final syncService = MySQLSyncService(
  config: SyncConfig(
    baseUrl: 'http://your-server:3000',
    apiKey: 'your-api-key-here',
  ),
);
```

## Database Maintenance

Clean up old sync logs (recommended: run weekly):

```sql
CALL cleanup_old_sync_logs(30);  -- Keep last 30 days
```


