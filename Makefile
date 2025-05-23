.PHONY: help build run stop clean dev test

# Default target
help:
	@echo "Available commands:"
	@echo "  make build    - Build the Docker image"
	@echo "  make run      - Run the production container"
	@echo "  make stop     - Stop and remove containers"
	@echo "  make clean    - Remove images and containers"
	@echo "  make dev      - Run development server"
	@echo "  make test     - Run tests in container"

# Build the Docker image
build:
	docker build -t passwordgen:latest .

# Run production container
run:
	docker-compose up -d

# Stop containers
stop:
	docker-compose down

# Clean up everything
clean:
	docker-compose down -v
	docker rmi passwordgen:latest || true

# Run development server
dev:
	docker-compose --profile dev up

# Run tests in container
test:
	docker run --rm -v $(PWD):/app -w /app node:18-alpine sh -c "npm ci && npm test -- --watchAll=false"