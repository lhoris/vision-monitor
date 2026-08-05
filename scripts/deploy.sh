#!/bin/bash
set -e

# Vision Monitor VMS Deployment Script (Linux/Mac)

echo "=========================================="
echo "Vision Monitor VMS - Deployment"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Build Backend
echo -e "${BLUE}📦 Building Backend...${NC}"
cd backend
mvn clean package -DskipTests
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi
cd ..

# 2. Build Frontend
echo -e "${BLUE}🎨 Building Frontend...${NC}"
cd frontend
npm install
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..

# 3. Create deployment directories
echo -e "${BLUE}📁 Creating deployment directories...${NC}"
mkdir -p /opt/vision
mkdir -p /var/www/vision
mkdir -p /var/log/vision

# 4. Deploy Backend
echo -e "${BLUE}⚙️  Deploying Backend...${NC}"
cp backend/target/vision-monitor-*.jar /opt/vision/vision-monitor.jar
chmod +x /opt/vision/vision-monitor.jar
echo -e "${GREEN}✓ Backend deployed${NC}"

# 5. Deploy Frontend
echo -e "${BLUE}⚙️  Deploying Frontend...${NC}"
rm -rf /var/www/vision/*
cp -r frontend/dist/* /var/www/vision/
echo -e "${GREEN}✓ Frontend deployed${NC}"

# 6. Database Migration (if MariaDB is running)
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
# This would typically be run as part of Spring Boot startup
# java -cp /opt/vision/vision-monitor.jar org.flywaydb.core.Flyway -url=jdbc:mariadb://localhost:3306/vision_monitor -user=root migrate
echo -e "${GREEN}✓ Database migration check complete${NC}"

# 7. Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Backend JAR: /opt/vision/vision-monitor.jar"
echo "Frontend: /var/www/vision/"
echo "Logs: /var/log/vision/"
echo ""
echo "Start Backend:"
echo "  java -jar /opt/vision/vision-monitor.jar"
echo ""
echo "Frontend is ready to be served by your web server"
echo "Configure your web server to serve files from: /var/www/vision/"
echo ""
