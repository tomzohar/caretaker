# Caretaker

A full-stack application for managing caretaker services.

## Prerequisites

- Node.js (v20 or higher)
- nvm (Node Version Manager)
- Docker and Docker Compose
- npm (comes with Node.js)

## Setup

1. Install nvm if you haven't already:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Restart your terminal or run:
   ```bash
   source ~/.bashrc  # for bash
   # or
   source ~/.zshrc   # for zsh
   ```

3. Install and use the correct Node.js version:
   ```bash
   nvm install 20
   nvm use 20
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up the database:
   ```bash
   npm run db:fresh
   ```

## Available Scripts

- `npm start` - Start both frontend and backend servers in parallel
- `npm run db:fresh` - Reset and restart the database (docker-compose down -v && docker-compose up -d)
- `npm run db:up` - Start the database containers
- `npm run db:down` - Stop and remove the database containers
- `npm run console` - Start the TypeScript REPL console
- `npm test` - Run all tests across all projects
- `npm run lint` - Run linting across all projects
- `npm run build` - Build all projects

## Project Structure

The project is organized as a monorepo using Nx:

- `apps/` - Contains the main applications
  - `caretaker-client/` - Frontend React application
  - `caretaker-backend/` - Backend Node.js application
- `libs/` - Contains shared libraries and components
  - `caretaker-login/` - Login and authentication components
  - `caretaker-data/` - Data management and API services
  - `caretaker-types/` - Shared TypeScript types
  - `caretaker-ui/` - Shared UI components

## Development

1. Start the development servers:
   ```bash
   npm start
   ```

2. The application will be available at:
   - Frontend: http://localhost:4200
   - Backend: http://localhost:3000

## Testing

Run all tests:
```bash
npm test
```

Run tests for a specific project:
```bash
npx nx test [project-name]
```

## Building for Production

Build all projects:
```bash
npm run build
```

## Deployment

The project uses GitHub Actions for CI/CD pipeline with Nx affected detection:

- Continuous Integration runs on every pull request and push to main (lint, test, build)
- Deployments are automatically triggered based on the Nx dependency graph analysis
- The system uses `nx affected:apps` to determine which applications should be deployed
- Deployments can also be triggered manually via the GitHub Actions interface

The deployment process follows these steps:
1. Runs the `check-affected.sh` script to determine which apps are affected by changes
2. Conditionally deploys the frontend to AWS S3/CloudFront if frontend app is affected
3. Conditionally deploys the backend to AWS ECS if backend app is affected

This approach ensures that only the necessary deployments run based on what has actually changed according to the Nx dependency graph, making the CI/CD pipeline more efficient.

To deploy manually:
```bash
# Frontend deployment
bash scripts/deploy-frontend.sh

# Backend deployment
bash scripts/deploy-backend.sh --tag <image-tag>
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT