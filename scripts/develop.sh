#!/bin/bash

# Vision Monitor VMS Local Development Script

echo "=========================================="
echo "Vision Monitor VMS - Development Setup"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}✗ Java 21 is not installed${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}✗ Maven is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites are met${NC}"
echo ""

# 2. Start MariaDB (if not running)
echo -e "${BLUE}🗄️  Checking MariaDB...${NC}"

# Check if MariaDB is running (Linux)
if command -v systemctl &> /dev/null; then
    if ! systemctl is-active --quiet mariadb; then
        echo -e "${YELLOW}⚠ MariaDB is not running, attempting to start...${NC}"
        sudo systemctl start mariadb
        sleep 2
    fi
fi

# Check if MariaDB is running (Mac - Homebrew)
if command -v brew &> /dev/null; then
    if ! brew services list | grep -q "mariadb.*started"; then
        echo -e "${YELLOW}⚠ MariaDB is not running, attempting to start...${NC}"
        brew services start mariadb
        sleep 2
    fi
fi

echo -e "${GREEN}✓ MariaDB is running${NC}"
echo ""

# 3. Frontend setup
echo -e "${BLUE}🎨 Frontend setup...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
cd ..
echo -e "${GREEN}✓ Frontend ready${NC}"
echo ""

# 4. Backend setup
echo -e "${BLUE}⚙️  Backend setup...${NC}"
cd backend
if [ ! -f ".maven-setup-done" ]; then
    echo "Installing Maven dependencies..."
    mvn clean install -DskipTests
    touch .maven-setup-done
fi
cd ..
echo -e "${GREEN}✓ Backend ready${NC}"
echo ""

# 5. Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""

# Start Backend
echo -e "${YELLOW}Starting Spring Boot Backend (port 8080)...${NC}"
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start Frontend
echo -e "${YELLOW}Starting React Dev Server (port 3000)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Development Environment Ready!${NC}"
echo "=========================================="
echo ""
echo "Frontend: ${GREEN}http://localhost:3000${NC}"
echo "Backend: ${GREEN}http://localhost:8080${NC}"
echo "Swagger UI: ${GREEN}http://localhost:8080/swagger-ui.html${NC}"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}To stop all services, press Ctrl+C${NC}"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Services stopped${NC}"
}

trap cleanup EXIT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
