# Freelancer Platform Microservices

This project is a microservices-based freelancer platform with multiple services handling different aspects of the application.

## Services

- **API Gateway** (Port 8000): Routes requests to appropriate microservices
- **Auth Service** (Port 5000): Handles authentication and authorization
- **Admin Service** (Port 5001): Admin panel and administrative functions
- **Analytical Service** (Port 5002): Analytics and reporting
- **Review Service** (Port 5003): User reviews and ratings
- **Bid Service** (Port 5004): Project bidding functionality
- **Project Service** (Port 5005): Project management
- **User Service** (Port 5006): User profile management
- **Notification Service** (Port 5007): Handles notifications
- **Socket Service** (Port 5008): Real-time communication

## Docker Setup

### Prerequisites

- Docker and Docker Compose installed on your system
- Node.js and npm (for local development)

### Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration values. The following environment variables are required:

- `MONGO_USERNAME`: MongoDB username
- `MONGO_PASSWORD`: MongoDB password
- `MONGO_DB`: MongoDB database name
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL_USER`: Email address for sending notifications
- `EMAIL_PASS`: Email password or app-specific password
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA secret key

**IMPORTANT: Never commit your .env file with real credentials to version control.**

### Running with Docker Compose

#### Running Microservices (without API Gateway)

1. Build and start all microservices:

```bash
docker-compose -f compose.yml up --build
```

2. To run in detached mode (background):

```bash
docker-compose -f compose.yml up -d
```

3. To stop all microservices:

```bash
docker-compose -f compose.yml down
```

#### Running API Gateway (Optional)

The API Gateway is separated into its own compose file as requested. This separation allows you to:
- Run your microservices without the API Gateway
- Access each service directly from your frontend
- Add the API Gateway later if your architecture needs change

If you want to use the API Gateway:

1. First, ensure the microservices are running
2. Copy the gateway environment file:
   ```bash
   cp .env.gateway.example .env.gateway
   ```
3. Then start the API Gateway:
   ```bash
   docker-compose -f compose.gateway.yml up --build
   ```
4. To stop the API Gateway:
   ```bash
   docker-compose -f compose.gateway.yml down
   ```

#### Viewing Logs

1. To view logs for all services:

```bash
docker-compose -f compose.yml logs -f
```

2. To view logs for a specific service:

```bash
docker-compose -f compose.yml logs -f service-name
```

### Accessing Services

Each service is directly accessible from the frontend:

- Auth Service: http://localhost:5000
- Admin Service: http://localhost:5001
- Analytical Service: http://localhost:5002
- Review Service: http://localhost:5003
- Bid Service: http://localhost:5004
- Project Service: http://localhost:5005
- User Service: http://localhost:5006
- Notification Service: http://localhost:5007
- Socket Service: http://localhost:5008

If you're using the API Gateway (optional):
- API Gateway: http://localhost:8000

## Development

For local development without Docker:

1. Install dependencies in each service directory:

```bash
cd service-name
npm install
```

2. Start each service individually:

```bash
npm start
```

## Database

The MongoDB database is accessible at:
- Docker: mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongodb:27017/${MONGO_DB}?authSource=admin
- Local: mongodb://localhost:27017/${MONGO_DB}

Where the values are taken from your environment variables.

## Troubleshooting

- If services can't connect to MongoDB, ensure the MongoDB container is running
- Check logs for specific error messages
- Ensure all required environment variables are set correctly
