#!/usr/bin/env bash
echo "Building and running tests in Docker environment..."
docker build -t hrlens-playwright -f docker/Dockerfile .
docker-compose -f docker/docker-compose.yml up --exit-code-from playwright-tests
