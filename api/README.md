## API Endpoints

- `POST /api/auth/register` -
  - Body: `{ "username": "string", "email": "string", "password": "string" }`

- `POST /api/auth/login` -
  - Body: `{ "email": "string", "password": "string" }`

- `GET /api/auth/profile` -
  - Headers: `Authorization: Bearer <token>`

- `POST /api/auth/logout` -