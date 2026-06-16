npm i# Rhythm Cloud

Backend + frontend for a simple music platform.

Run backend:

```bash
npm install
npm run dev
```

Run frontend (in another terminal):

```bash
npm run client
```

API docs: `GET /api/docs`

Notes for resume:
- Implemented JWT refresh tokens, email verification, password reset
- Role-based authorization for artists and users
- Music CRUD, pagination, search, file uploads via ImageKit
- Rate limiting, input validation (Joi), centralized error handling
- React frontend (Vite) with auth flows and music listing
