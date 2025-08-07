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
