#!/bin/bash

# HealthTech Platform Deployment Script
# Supports development, staging, and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
SERVICES=""
BUILD_FRESH=false
SETUP_DB=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment: development, staging, production (default: development)"
    echo "  -s, --services SERVICES  Comma-separated list of services to deploy (default: all)"
    echo "  -b, --build             Force rebuild of Docker images"
    echo "  -d, --setup-db          Setup databases and indexes"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e development -b -d                    # Full development setup"
    echo "  $0 -e production -s auth,notification      # Deploy specific services to production"
    echo "  $0 -e staging --build                      # Rebuild and deploy to staging"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--services)
            SERVICES="$2"
            shift 2
            ;;
        -b|--build)
            BUILD_FRESH=true
            shift
            ;;
        -d|--setup-db)
            SETUP_DB=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Must be one of: development, staging, production"
    exit 1
fi

print_status "Starting deployment for environment: $ENVIRONMENT"

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    print_error ".env file not found!"
    print_error "Please create .env file with required configuration"
    exit 1
fi

# Load environment variables
source .env

# Determine Docker Compose files
COMPOSE_FILES="-f docker-compose.yml"

case $ENVIRONMENT in
    development)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.local.yml"
        ;;
    production)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.production.yml"
        ;;
    staging)
        # Use production settings for staging
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.production.yml"
        ;;
esac

print_status "Using Docker Compose files: $COMPOSE_FILES"

# Setup database if requested
if [[ "$SETUP_DB" == true ]]; then
    print_status "Setting up databases and indexes..."
    
    if command -v python3 &> /dev/null; then
        if [[ -f "scripts/mongodb_manager.py" ]]; then
            python3 scripts/mongodb_manager.py --action setup --uri "$MONGODB_URI"
            print_success "Database setup completed"
        else
            print_warning "MongoDB manager script not found, skipping database setup"
        fi
    else
        print_warning "Python3 not found, skipping database setup"
    fi
fi

# Build options
BUILD_OPTS=""
if [[ "$BUILD_FRESH" == true ]]; then
    BUILD_OPTS="--build --no-cache"
    print_status "Building fresh Docker images..."
else
    BUILD_OPTS="--build"
fi

# Deploy services
if [[ -n "$SERVICES" ]]; then
    # Deploy specific services
    IFS=',' read -ra SERVICE_ARRAY <<< "$SERVICES"
    print_status "Deploying services: ${SERVICE_ARRAY[*]}"
    
    for service in "${SERVICE_ARRAY[@]}"; do
        print_status "Deploying service: $service"
        docker-compose $COMPOSE_FILES up $BUILD_OPTS -d "$service"
    done
else
    # Deploy all services
    print_status "Deploying all services..."
    docker-compose $COMPOSE_FILES up $BUILD_OPTS -d
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Health checks
print_status "Performing health checks..."

# Check if auth service is running
if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Auth service is healthy"
else
    print_warning "Auth service health check failed"
fi

# Check MongoDB connectivity
if [[ "$ENVIRONMENT" == "development" ]]; then
    if docker exec healthtech-mongo-1 mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_warning "MongoDB health check failed"
    fi
fi

# Show running services
print_status "Running services:"
docker-compose $COMPOSE_FILES ps

# Show logs for any failed services
FAILED_SERVICES=$(docker-compose $COMPOSE_FILES ps --filter "status=exited" --format "table {{.Service}}" | tail -n +2)

if [[ -n "$FAILED_SERVICES" ]]; then
    print_warning "Some services failed to start:"
    echo "$FAILED_SERVICES"
    
    for service in $FAILED_SERVICES; do
        print_error "Logs for failed service: $service"
        docker-compose $COMPOSE_FILES logs --tail=20 "$service"
    done
else
    print_success "All services started successfully!"
fi

# Environment-specific post-deployment steps
case $ENVIRONMENT in
    development)
        print_status "Development environment ready!"
        echo ""
        echo "Available services:"
        echo "  - Auth: http://auth.localhost"
        echo "  - Feedback: http://feedback.localhost"
        echo "  - Reminder: http://reminder.localhost"
        echo "  - Traefik Dashboard: http://localhost:8080"
        echo ""
        echo "Default admin credentials:"
        echo "  Email: admin@hospital.com"
        echo "  Password: admin123"
        echo "  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"
        ;;
    staging)
        print_status "Staging environment deployed!"
        print_warning "Remember to run integration tests"
        ;;
    production)
        print_status "Production environment deployed!"
        print_warning "Monitor logs and metrics closely"
        print_warning "Ensure all security configurations are in place"
        ;;
esac

print_success "Deployment completed successfully!"

# Show useful commands
echo ""
print_status "Useful commands:"
echo "  View logs: docker-compose $COMPOSE_FILES logs -f [service]"
echo "  Stop services: docker-compose $COMPOSE_FILES down"
echo "  Restart service: docker-compose $COMPOSE_FILES restart [service]"
echo "  Database stats: python3 scripts/mongodb_manager.py --action stats"
