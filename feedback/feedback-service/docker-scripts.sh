#!/bin/bash

# Docker management scripts for Feedback Microservice

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Function to build the Docker image
build_image() {
    print_header "Building Docker Image"
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        exit 1
    fi
    
    # Build the image
    print_status "Building feedback-microservice image..."
    docker build -t feedback-microservice:latest .
    
    if [ $? -eq 0 ]; then
        print_status "Docker image built successfully!"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to build production image
build_production() {
    print_header "Building Production Docker Image"
    
    if [ ! -f "Dockerfile.production" ]; then
        print_error "Dockerfile.production not found in current directory"
        exit 1
    fi
    
    print_status "Building production image..."
    docker build -f Dockerfile.production -t feedback-microservice:production .
    
    if [ $? -eq 0 ]; then
        print_status "Production Docker image built successfully!"
    else
        print_error "Failed to build production Docker image"
        exit 1
    fi
}

# Function to run the container
run_container() {
    print_header "Running Docker Container"
    
    # Stop existing container if running
    if [ "$(docker ps -q -f name=feedback-microservice)" ]; then
        print_status "Stopping existing container..."
        docker stop feedback-microservice
        docker rm feedback-microservice
    fi
    
    # Run new container
    print_status "Starting new container..."
    docker run -d \
        --name feedback-microservice \
        -p 8000:8000 \
        -e MONGODB_URL="mongodb+srv://farelrick22:feedback@cluster0.5v3qw9e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" \
        -e DATABASE_NAME="feedbackm" \
        -v $(pwd)/logs:/app/logs \
        feedback-microservice:latest
    
    if [ $? -eq 0 ]; then
        print_status "Container started successfully!"
        print_status "API is available at: http://localhost:8000"
        print_status "API Documentation: http://localhost:8000/docs"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to use docker-compose
compose_up() {
    print_header "Starting Services with Docker Compose"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in current directory"
        exit 1
    fi
    
    print_status "Starting services..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_status "Services started successfully!"
        print_status "API is available at: http://localhost:8000"
        print_status "Nginx proxy is available at: http://localhost:80"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Function to stop docker-compose services
compose_down() {
    print_header "Stopping Services"
    
    print_status "Stopping services..."
    docker-compose down
    
    if [ $? -eq 0 ]; then
        print_status "Services stopped successfully!"
    else
        print_error "Failed to stop services"
        exit 1
    fi
}

# Function to view logs
view_logs() {
    print_header "Viewing Container Logs"
    
    if [ -z "$1" ]; then
        # Show logs for feedback-api service
        docker-compose logs -f feedback-api
    else
        # Show logs for specific service
        docker-compose logs -f $1
    fi
}

# Function to show container status
show_status() {
    print_header "Container Status"
    
    print_status "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    print_status "Docker Compose services:"
    docker-compose ps
}

# Function to clean up
cleanup() {
    print_header "Cleaning Up"
    
    print_status "Stopping and removing containers..."
    docker-compose down -v
    
    print_status "Removing unused images..."
    docker image prune -f
    
    print_status "Removing unused volumes..."
    docker volume prune -f
    
    print_status "Cleanup completed!"
}

# Function to run health check
health_check() {
    print_header "Health Check"
    
    print_status "Checking API health..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/)
    
    if [ "$response" -eq 200 ]; then
        print_status "✅ API is healthy (HTTP $response)"
    else
        print_error "❌ API is unhealthy (HTTP $response)"
    fi
    
    print_status "Checking database health..."
    db_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/db)
    
    if [ "$db_response" -eq 200 ]; then
        print_status "✅ Database is healthy (HTTP $db_response)"
    else
        print_error "❌ Database is unhealthy (HTTP $db_response)"
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 {build|build-prod|run|up|down|logs|status|health|cleanup|help}"
    echo ""
    echo "Commands:"
    echo "  build      - Build Docker image"
    echo "  build-prod - Build production Docker image"
    echo "  run        - Run container directly"
    echo "  up         - Start services with docker-compose"
    echo "  down       - Stop services with docker-compose"
    echo "  logs       - View container logs"
    echo "  status     - Show container status"
    echo "  health     - Run health check"
    echo "  cleanup    - Clean up containers and images"
    echo "  help       - Show this help message"
}

# Main script logic
main() {
    check_docker
    
    case "$1" in
        build)
            build_image
            ;;
        build-prod)
            build_production
            ;;
        run)
            run_container
            ;;
        up)
            compose_up
            ;;
        down)
            compose_down
            ;;
        logs)
            view_logs $2
            ;;
        status)
            show_status
            ;;
        health)
            health_check
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"