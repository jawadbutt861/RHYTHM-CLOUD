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

API docs: `GET /api/docs`

Notes for resume:
- Implemented JWT refresh tokens, email verification, password reset
- Role-based authorization for artists and users
- Music CRUD, pagination, search, file uploads via ImageKit
- Rate limiting, input validation (Joi), centralized error handling
- React frontend (Vite) with auth flows and music listing
