npm i# Rhythm Cloud

Backend and frontend are now separated into `backend/` and `frontend/` folders.

Run backend:

```bash
cd backend
npm install
npm run dev
```

Run frontend (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

Or from the root folder:

```bash
npm run backend:install
npm run frontend:install
npm run dev
npm run client
```

Production checklist:
- Build frontend with `cd frontend && npm run build`
- Start backend with `cd backend && npm start`
- Use a production-ready Node process manager like `pm2` or similar
- Set `NODE_ENV=production` and provide a valid `.env` with DB and auth secrets

API docs: `GET /api/docs`

Notes for resume:
- Implemented JWT refresh tokens, email verification, password reset
- Role-based authorization for artists and users
- Music CRUD, pagination, search, file uploads via ImageKit
- Rate limiting, input validation (Joi), centralized error handling
- React frontend (Vite) with auth flows and music listing
