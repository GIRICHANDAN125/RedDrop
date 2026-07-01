# Project Structure

```text
RedDropAI/
├── backend/                  # Express API, models, controllers, services, middleware
├── frontend/                 # Expo React Native application
├── docs/                     # Project and API documentation
├── assets/                   # Repository-level static assets
├── .github/                  # GitHub workflows and templates
├── .env.example              # Example environment variables
├── .gitignore                # Repository ignore rules
├── .editorconfig             # Shared editor formatting defaults
├── .prettierrc               # Prettier configuration
└── LICENSE                   # Open-source license
```

## Backend

The backend is organized by responsibility:

- `config/` for database and socket initialization
- `controllers/` for request handlers
- `middleware/` for auth and upload handling
- `models/` for Mongoose schemas
- `routes/` for HTTP endpoints
- `services/` for reusable business services
- `utils/` for shared helpers

## Frontend

The frontend is split into:

- `src/api/` for HTTP clients
- `src/components/` for shared UI
- `src/context/` for app state
- `src/hooks/` for reusable hooks
- `src/navigation/` for route definitions
- `src/screens/` for feature screens
- `src/services/` for socket and integration helpers
- `src/utils/` for theme and styling tokens
