# Environment Setup Guide

## Overview
This project uses environment variables to manage sensitive configuration data. This ensures that secrets are not exposed in version control.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual values:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Update the following variables with your actual credentials:**

### Required Environment Variables

#### Database Configuration
- `MONGO_INITDB_ROOT_USERNAME`: MongoDB root username (default: admin)
- `MONGO_INITDB_ROOT_PASSWORD`: MongoDB root password (change this!)

#### RabbitMQ Configuration
- `RABBITMQ_USER`: RabbitMQ username
- `RABBITMQ_PASS`: RabbitMQ password

#### JWT Configuration
- `JWT_SECRET`: Secret key for JWT token signing (must be strong and unique)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 24h)

#### Cloudinary Configuration
Get these from your [Cloudinary Dashboard](https://cloudinary.com/console):
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env` files to version control**
   - The `.env` file is already included in `.gitignore`
   - Only commit `.env.example` with placeholder values

2. **Use strong, unique passwords and secrets**
   - Generate a strong JWT secret: `openssl rand -base64 64`
   - Use different passwords for each environment

3. **Environment-specific configurations**
   - Use different `.env` files for development, staging, and production
   - Never use development credentials in production

## Usage

Once your `.env` file is configured, you can start the services:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` are correct
   - Ensure MongoDB container is healthy: `docker-compose ps`

2. **JWT Token Issues**
   - Make sure `JWT_SECRET` is set and is sufficiently long/complex
   - Verify `JWT_EXPIRES_IN` format (e.g., "24h", "7d", "30m")

3. **Cloudinary Upload Failures**
   - Verify all three Cloudinary environment variables are correct
   - Check your Cloudinary account limits and permissions

### Checking Environment Variables

To verify your environment variables are loaded correctly:

```bash
# Check if variables are set
docker-compose config

# Inspect a specific service's environment
docker inspect <container_name> | grep -A 20 "Env"
```

## Production Deployment

For production deployment:

1. Use a secure method to manage environment variables (e.g., Docker secrets, Kubernetes secrets)
2. Never use default passwords
3. Use strong, unique values for all secrets
4. Regularly rotate credentials
5. Monitor access logs and set up alerts

## Contributing

When contributing to this project:
1. Never commit actual credential values
2. Update `.env.example` if you add new environment variables
3. Document any new environment variables in this file 