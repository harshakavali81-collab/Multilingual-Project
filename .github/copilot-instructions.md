<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Multilingual KB Platform - Copilot Instructions

## Project Overview

This is a Multilingual Knowledge Base Platform consisting of:
- **Backend**: FastAPI Python application with PostgreSQL database
- **Frontend**: React application with Material-UI components
- **Deployment**: Docker and Docker Compose support

## Development Guidelines

### Backend Development

- Use FastAPI for all API endpoints
- Follow PEP 8 style guide
- Use Pydantic models for request/response validation
- Add type hints to all functions
- Write docstrings for all functions and classes
- Use `.env` file for environment configuration

### Frontend Development

- Use React 18+ with functional components and hooks
- Use Material-UI (MUI) for UI components
- Follow React naming conventions and best practices
- Use CSS modules or styled-components for styling
- Implement responsive design for mobile devices
- Use i18next for internationalization

### Database

- Use PostgreSQL for production database
- Use SQLAlchemy ORM for database operations
- Create migrations for schema changes using Alembic
- Always handle database connections properly

### Code Quality

- Format code with Black (Python) and Prettier (JavaScript)
- Lint code with Flake8 (Python) and ESLint (JavaScript)
- Write unit tests for critical functions
- Use type checking with mypy (Python)

### File Naming

- Python files: lowercase_with_underscores.py
- React components: PascalCase.js
- CSS files: lowercase-with-dashes.css
- Test files: test_*.py or *.test.js

### Git Conventions

- Use descriptive commit messages
- Branch naming: feature/description, bugfix/description, docs/description
- Create pull requests before merging to main

## API Development

- All endpoints should be documented in docstrings
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return proper HTTP status codes
- Include error handling and validation
- Use request/response models from models.py

## Supported Languages

The platform supports:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Portuguese (pt)
- Russian (ru)

## Docker Development

- Keep Dockerfiles minimal and use multi-stage builds
- Use .dockerignore files
- Tag images properly
- Test images locally before deployment

## Environment Variables

Backend:
- `DATABASE_URL`: PostgreSQL connection string
- `PYTHONUNBUFFERED`: Set to 1 for instant logging

Frontend:
- `REACT_APP_API_URL`: Backend API URL

## Testing

Run tests with:
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Deployment

Use Docker Compose for development and deployment:
```bash
docker-compose up --build
```

## Common Tasks

### Add a new API endpoint
1. Add model in `backend/models.py`
2. Add service method in `backend/services.py`
3. Add endpoint in `backend/main.py`
4. Add frontend integration in `frontend/src/App.js`

### Add support for a new language
1. Add language code to LanguageService in `backend/services.py`
2. Add translations to i18next in `frontend/src/index.js`
3. Update language selector in `frontend/src/App.js`

### Fix a bug
1. Create a new branch: `git checkout -b bugfix/description`
2. Write a test that reproduces the bug
3. Fix the bug
4. Verify tests pass
5. Commit and create a pull request

## Performance Optimization

- Use pagination for large result sets
- Implement caching for frequently accessed data
- Use database indexes for common queries
- Optimize React components with memo and useMemo
- Lazy load images and components

## Security Best Practices

- Validate all user inputs
- Use environment variables for sensitive data
- Implement CORS properly
- Use HTTPS in production
- Sanitize user-generated content
- Implement rate limiting

## Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- Material-UI Documentation: https://mui.com/
- Docker Documentation: https://docs.docker.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
