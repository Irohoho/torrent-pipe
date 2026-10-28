#!/bin/bash

# Test script for Torrent Pipe
# This script verifies that all components are working

echo "🧪 Torrent Pipe Test Suite"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Check if Node.js is installed
echo "Test 1: Node.js installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    pass "Node.js is installed ($NODE_VERSION)"
else
    fail "Node.js is not installed"
fi
echo ""

# Test 2: Check if files exist
echo "Test 2: File structure"
if [ -f "torrent-pipe-provider/provider.js" ]; then
    pass "Provider file exists"
else
    fail "Provider file not found"
fi

if [ -f "torrent-pipe-provider/manifest.json" ]; then
    pass "Manifest file exists"
else
    fail "Manifest file not found"
fi

if [ -f "torrent-pipe-api/server.js" ]; then
    pass "API server file exists"
else
    fail "API server file not found"
fi

if [ -f "torrent-pipe-api/cli.js" ]; then
    pass "CLI file exists"
else
    fail "CLI file not found"
fi
echo ""

# Test 3: Check if scripts are executable
echo "Test 3: Script permissions"
if [ -x "torrent-pipe-api/server.js" ]; then
    pass "Server script is executable"
else
    warn "Server script is not executable (run: chmod +x torrent-pipe-api/server.js)"
fi

if [ -x "torrent-pipe-api/cli.js" ]; then
    pass "CLI script is executable"
else
    warn "CLI script is not executable (run: chmod +x torrent-pipe-api/cli.js)"
fi
echo ""

# Test 4: Validate JSON files
echo "Test 4: JSON validation"
if command -v node &> /dev/null; then
    if node -e "JSON.parse(require('fs').readFileSync('torrent-pipe-provider/manifest.json', 'utf8'))" 2>/dev/null; then
        pass "manifest.json is valid JSON"
    else
        fail "manifest.json is invalid JSON"
    fi
else
    warn "Skipping JSON validation (Node.js not installed)"
fi
echo ""

# Test 5: Check manifest URLs
echo "Test 5: Manifest configuration"
MANIFEST_URI=$(cat torrent-pipe-provider/manifest.json | grep -o '"manifestURI".*' | cut -d'"' -f4)
PAYLOAD_URI=$(cat torrent-pipe-provider/manifest.json | grep -o '"payloadURI".*' | cut -d'"' -f4)

if [[ $MANIFEST_URI == *"YOUR-USERNAME"* ]] || [[ $MANIFEST_URI == *"YOUR-REPO"* ]]; then
    warn "manifestURI needs to be updated with your GitHub username/repo"
else
    pass "manifestURI looks configured"
fi

if [[ $PAYLOAD_URI == *"YOUR-USERNAME"* ]] || [[ $PAYLOAD_URI == *"YOUR-REPO"* ]]; then
    warn "payloadURI needs to be updated with your GitHub username/repo"
else
    pass "payloadURI looks configured"
fi
echo ""

# Test 6: Try to start the server (optional)
echo "Test 6: API Server (optional - will attempt to start)"
if command -v node &> /dev/null; then
    echo "Starting server for 3 seconds..."
    
    # Start server in background
    cd torrent-pipe-api
    timeout 3 node server.js &> /tmp/torrent-pipe-test.log &
    SERVER_PID=$!
    
    # Wait a bit for server to start
    sleep 1
    
    # Test health endpoint
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s http://localhost:3456/health 2>/dev/null)
        if [[ $RESPONSE == *"ok"* ]]; then
            pass "Server started and health check passed"
        else
            warn "Server may not have started correctly"
        fi
    else
        warn "curl not available, skipping server test"
    fi
    
    # Kill the server
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
    cd ..
else
    warn "Node.js not available, skipping server test"
fi
echo ""

# Summary
echo "=========================="
echo "Test Summary"
echo "=========================="
echo -e "${GREEN}Passed:${NC} $PASS"
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}Failed:${NC} $FAIL"
fi
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All critical tests passed! ✓${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update manifest.json with your GitHub URLs"
    echo "2. Push to GitHub"
    echo "3. Add the provider to Seanime"
    echo "4. Start the API server: cd torrent-pipe-api && node server.js"
    echo ""
    echo "See SETUP.md for detailed instructions."
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi
