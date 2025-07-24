#!/bin/bash

# HealthTech Platform - Comprehensive Linting Script
# Runs all linting tools across the entire codebase

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Default values
FIX_MODE=false
SERVICES=""
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --services)
            SERVICES="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --fix              Auto-fix issues where possible"
            echo "  --services NAMES   Lint specific services (comma-separated)"
            echo "  --verbose, -v      Verbose output"
            echo "  --help, -h         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Lint all services"
            echo "  $0 --fix                     # Lint and auto-fix all services"
            echo "  $0 --services auth,feedback  # Lint specific services"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Starting HealthTech Platform linting..."

# Check if we're in the project root
if [[ ! -f "pyproject.toml" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install linting dependencies if not present
print_status "Checking linting dependencies..."
if ! command -v black &> /dev/null; then
    print_status "Installing linting dependencies..."
    pip install black isort flake8 mypy bandit pre-commit
fi

# Define services to lint
if [[ -z "$SERVICES" ]]; then
    SERVICES="auth,feedback,reminder,notification,translation,analysis,data,optimization,chatbot,event,forecast"
fi

IFS=',' read -ra SERVICE_ARRAY <<< "$SERVICES"

# Linting results
TOTAL_ERRORS=0
FAILED_SERVICES=()

print_status "Linting services: ${SERVICES}"
echo ""

# Function to run linting on a service
lint_service() {
    local service=$1
    local service_errors=0
    
    if [[ ! -d "$service" ]]; then
        print_warning "Service directory '$service' not found, skipping..."
        return 0
    fi
    
    print_status "Linting service: $service"
    
    # Black formatting
    print_status "  Running Black formatter..."
    if [[ "$FIX_MODE" == "true" ]]; then
        if black --line-length=120 "$service/" 2>/dev/null; then
            print_success "  ✅ Black formatting applied"
        else
            print_error "  ❌ Black formatting failed"
            ((service_errors++))
        fi
    else
        if black --check --line-length=120 "$service/" 2>/dev/null; then
            print_success "  ✅ Black formatting OK"
        else
            print_warning "  ⚠️  Black formatting issues found (use --fix to auto-fix)"
            ((service_errors++))
        fi
    fi
    
    # isort import sorting
    print_status "  Running isort..."
    if [[ "$FIX_MODE" == "true" ]]; then
        if isort --profile=black --line-length=120 "$service/" 2>/dev/null; then
            print_success "  ✅ Import sorting applied"
        else
            print_error "  ❌ Import sorting failed"
            ((service_errors++))
        fi
    else
        if isort --check-only --profile=black --line-length=120 "$service/" 2>/dev/null; then
            print_success "  ✅ Import sorting OK"
        else
            print_warning "  ⚠️  Import sorting issues found (use --fix to auto-fix)"
            ((service_errors++))
        fi
    fi
    
    # Flake8 linting
    print_status "  Running Flake8..."
    if flake8 "$service/" --max-line-length=120 2>/dev/null; then
        print_success "  ✅ Flake8 linting passed"
    else
        print_error "  ❌ Flake8 linting failed"
        if [[ "$VERBOSE" == "true" ]]; then
            flake8 "$service/" --max-line-length=120
        fi
        ((service_errors++))
    fi
    
    # MyPy type checking (if main.py exists)
    if [[ -f "$service/main.py" ]]; then
        print_status "  Running MyPy type checking..."
        if mypy "$service/main.py" --ignore-missing-imports 2>/dev/null; then
            print_success "  ✅ MyPy type checking passed"
        else
            print_warning "  ⚠️  MyPy type checking issues found"
            if [[ "$VERBOSE" == "true" ]]; then
                mypy "$service/main.py" --ignore-missing-imports
            fi
            ((service_errors++))
        fi
    fi
    
    # Bandit security check
    print_status "  Running Bandit security check..."
    if bandit -r "$service/" -f json -o /tmp/bandit-$service.json 2>/dev/null; then
        print_success "  ✅ Bandit security check passed"
    else
        print_warning "  ⚠️  Bandit security issues found"
        if [[ "$VERBOSE" == "true" ]] && [[ -f "/tmp/bandit-$service.json" ]]; then
            cat "/tmp/bandit-$service.json"
        fi
        ((service_errors++))
    fi
    
    if [[ $service_errors -gt 0 ]]; then
        FAILED_SERVICES+=("$service")
        print_error "  Service '$service' has $service_errors linting issues"
    else
        print_success "  Service '$service' passed all linting checks"
    fi
    
    ((TOTAL_ERRORS += service_errors))
    echo ""
}

# Lint each service
for service in "${SERVICE_ARRAY[@]}"; do
    lint_service "$service"
done

# Lint root Python files
print_status "Linting root Python files..."
root_errors=0

for file in *.py; do
    if [[ -f "$file" ]]; then
        print_status "  Checking $file..."
        
        if [[ "$FIX_MODE" == "true" ]]; then
            black --line-length=120 "$file" 2>/dev/null
            isort --profile=black --line-length=120 "$file" 2>/dev/null
        fi
        
        if ! flake8 "$file" --max-line-length=120 2>/dev/null; then
            print_error "  ❌ $file has linting issues"
            ((root_errors++))
        else
            print_success "  ✅ $file passed linting"
        fi
    fi
done

((TOTAL_ERRORS += root_errors))

# Summary
echo ""
print_status "=== LINTING SUMMARY ==="

if [[ $TOTAL_ERRORS -eq 0 ]]; then
    print_success "🎉 All linting checks passed!"
    print_success "Total services checked: ${#SERVICE_ARRAY[@]}"
    print_success "Total errors: 0"
else
    print_error "❌ Linting completed with $TOTAL_ERRORS errors"
    print_error "Failed services: ${FAILED_SERVICES[*]}"
    
    if [[ "$FIX_MODE" == "false" ]]; then
        print_status "💡 Run with --fix to auto-fix formatting issues"
    fi
fi

echo ""
print_status "Linting tools used:"
print_status "  - Black (code formatting)"
print_status "  - isort (import sorting)"
print_status "  - Flake8 (style guide enforcement)"
print_status "  - MyPy (type checking)"
print_status "  - Bandit (security analysis)"

exit $TOTAL_ERRORS
