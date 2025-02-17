# User Management and File Management API (NestJS)

This is a user management and file management REST API built using [NestJS](https://nestjs.com/). The application provides endpoints for creating, updating, deleting, and listing users as well as uploading, downloading, and deleting files. It also includes user validation and database transaction handling.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Docker Compose Setup](#docker-compose-setup)
- [Unit Tests](#unit-tests)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Management**
  - User creation, listing, updating, and deletion
  - Soft delete for users (mark as inactive)
  - Pagination and filtering of user lists
  - Authentication and user validation
  - Transaction handling using Unit of Work
- **File Management**
  - File upload and download
  - File deletion
  - Secure access to uploaded files

## Technologies

- [NestJS](https://nestjs.com/) - Framework
- [TypeScript](https://www.typescriptlang.org/) - Language
- [Jest](https://jestjs.io/) - Testing Framework
- [Docker](https://www.docker.com/) (Optional) - Containerization
- PostgreSQL or MongoDB (depending on your database choice)

---

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- A running PostgreSQL/MongoDB instance

### Install Dependencies

```json
  npm install
  ```

## Running the Application

### Development Mode

```json
  npm run start
```

### Watch Mode (Hot Reload)

```json
  npm run start:dev
```

### Production Mode

```json
  npm run start:prod
```

## Environment Variables

- Create a .env file in the project root with the following:

```json
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=123456
POSTGRES_DB=assignment
PORT=3000
JWT_SECRET=123456
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=3600
BASE_URL=http://localhost:3000
```
- Modify these as per your environment setup.

## API Endpoints

### User Management

| Method | Endpoint | Description |
| :---: | :---: | :---: |
| POST | 	/users | Create a new user |
| GET |	/users |	List all users (filtered) |
| GET |	/users/:id |	Get a user by ID |
| PATCH |	/users/:id |	Update a user|
| DELETE |	/users/:id |	Soft delete a user |

### File Management

| Method | Endpoint | Description |
| :---: | :---: | :---: |
| POST | /files/upload |	Upload a file |
| GET |	/files/:id |	Download a file by ID |
| DELETE |	/files/:id |	Delete a file by ID |

## Docker Compose Setup

To simplify the deployment and management of the application and its database, you can use Docker Compose. The docker-compose.yml file provided defines services for the application and a PostgreSQL database.

### Docker Compose Services

- app: The NestJS application.

- postgres: PostgreSQL database service.

### Running with Docker Compose

To start the application and its dependencies using Docker Compose:

- Ensure that Docker and Docker Compose are installed on your system.

- Run the following command:

```json 
docker-compose up --build
```

This will build the Docker images and start the services. You can access the application at http://localhost:3000.

### Stopping the Services

To stop the running containers:

'''json
docker-compose down
'''

## Unit Tests

Unit tests are written using Jest. To run the tests, use the following command:

```json
npm run test
```

For test coverage:

```json
npm run test:cov
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.