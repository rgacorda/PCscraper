#!/bin/bash

# Test script for cron endpoint
# Usage: ./test-cron.sh [local|production]

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep CRON_SECRET | xargs)
fi

# Determine environment
ENV="${1:-local}"

if [ "$ENV" = "local" ]; then
    URL="http://localhost:3000/api/cron/scrape"
    echo -e "${YELLOW}Testing LOCAL cron endpoint...${NC}"
elif [ "$ENV" = "production" ]; then
    if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
        echo -e "${RED}Error: NEXT_PUBLIC_APP_URL not set${NC}"
        exit 1
    fi
    URL="$NEXT_PUBLIC_APP_URL/api/cron/scrape"
    echo -e "${YELLOW}Testing PRODUCTION cron endpoint...${NC}"
else
    echo -e "${RED}Usage: ./test-cron.sh [local|production]${NC}"
    exit 1
fi

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}Error: CRON_SECRET not set in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}URL: $URL${NC}"
echo -e "${YELLOW}Using CRON_SECRET from .env${NC}"
echo ""

# Test the endpoint
echo -e "${GREEN}Sending request...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$URL" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo -e "${YELLOW}HTTP Status: $HTTP_CODE${NC}"
echo -e "${YELLOW}Response:${NC}"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# Check result
if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo -e "${GREEN}✅ Success! Cron endpoint is working${NC}"
else
    echo ""
    echo -e "${RED}❌ Failed! Check the response above${NC}"
    exit 1
fi
