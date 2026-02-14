# Backend Setup and Usage Guide

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
node src/database/init.js
```

This will create the SQLite database at `data/database.db` with all required tables and sample data.

**Default Admin Account:**
- Student ID: `admin001`
- Password: `admin123`

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

To use a different port:
```bash
PORT=3001 npm start
```

## API Documentation

See [README.md](./README.md) for complete API documentation.

### Quick Test

Test that the server is running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","message":"申城学联 API is running"}
```

## Database

The SQLite database is located at `data/database.db`.

### Reset Database

To completely reset the database:
```bash
rm data/database.db
node src/database/init.js
```

### Database Schema

The database includes the following main tables:
- `users` - User accounts and profiles
- `activities` - Activity announcements
- `venues` - Venue information
- `reservations` - Venue reservations
- `materials` - Resource sharing
- `tips` - Campus tips (wiki-style)
- `listings` - Marketplace listings
- `orders` - Order management
- `groups` - Communities
- `projects` - Cross-school projects
- `messages` - Anonymous chat messages
- `ai_sessions` - AI chat sessions

See `src/database/init.js` for complete schema.

## Important Notes

### Async/Await Requirement

Due to the promise-based database wrapper, **all route handlers that use database queries must be marked as `async`**.

Example:
```javascript
// Correct
router.get('/', async (req, res) => {
  const items = await db.prepare('SELECT * FROM items').all();
  res.json({ items });
});

// Incorrect - will cause errors
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM items').all();
  res.json({ items });
});
```

### File Uploads

File uploads are configured for the `uploads/` directory. Make sure this directory exists and has proper write permissions.

### Environment Variables

You can set the following environment variables:

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT signing secret (default: development secret)

**Important:** Set a secure `JWT_SECRET` in production!

## Troubleshooting

### Port Already in Use

If you get an `EADDRINUSE` error, either:
1. Kill the process using the port: `lsof -ti:3000 | xargs kill -9`
2. Or use a different port: `PORT=3001 npm start`

### Database Locked Error

If you encounter database locking issues, ensure only one server instance is running.

### Module Not Found Errors

Run `npm install` to ensure all dependencies are installed.

## Development Tips

### View Database Contents

Use a SQLite browser tool like DB Browser for SQLite to view `data/database.db`.

### Test API Endpoints

Use curl, Postman, or any HTTP client:
```bash
# Get venues
curl http://localhost:3000/api/venues

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}'
```

### Logging

Server logs are printed to console. For production, consider implementing a logging solution like Winston or Morgan.

## Production Deployment

1. Set secure environment variables
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name shencheng-api
   ```
3. Configure reverse proxy (Nginx)
4. Enable HTTPS
5. Set up regular database backups

## Security Considerations

- Change default admin password
- Use strong JWT_SECRET
- Enable HTTPS in production
- Implement rate limiting
- Add input validation
- Sanitize user inputs
- Use CORS appropriately
- Implement request size limits

## Support

For issues or questions, please contact the development team.
