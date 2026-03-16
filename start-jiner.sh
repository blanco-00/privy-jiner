#!/bin/bash
set -e

JINER_PORT=3001
OPENCLOW_PORT=18789
NODE_MIN_VERSION=20

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

check_node_version() {
  log_info "Checking Node.js version..."
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -lt "$NODE_MIN_VERSION" ]; then
    log_error "Node.js $NODE_MIN_VERSION+ required, but found v$(node -v)"
    exit 1
  fi
  log_info "Node.js $(node -v) ✓"
}

check_port() {
  log_info "Checking port $1 availability..."
  if lsof -i :$1 >/dev/null 2>&1; then
    log_warn "Port $1 is already in use"
    return 1
  else
    log_info "Port $1 is available ✓"
    return 0
  fi
}

check_dependencies() {
  log_info "Checking dependencies..."
  if [ -d "node_modules" ]; then
    log_info "Dependencies already installed ✓"
  else
    log_info "Installing dependencies..."
    npm install
  fi
}

build_project() {
  log_info "Building project..."
  npm run build
  log_info "Building OpenClaw plugin..."
  npm run build:plugin
}

start_jiner() {
  log_info "Starting Jiner service on port $JINER_PORT..."
  cd packages/core
  node dist/cli.js &
  cd ../..
  log_info "Jiner started in background"
}

show_guide() {
  echo ""
  echo "============================================"
  echo -e "${GREEN}🎉 Jiner is running!${NC}"
  echo "============================================"
  echo ""
  echo "Jiner API:    http://localhost:$JINER_PORT"
  echo "OpenClaw:    http://localhost:$OPENCLOW_PORT"
  echo ""
  echo "To configure OpenClaw plugin:"
  echo "  1. Open OpenClaw at http://localhost:$OPENCLOW_PORT"
  echo "  2. Go to Plugin Settings"
  echo "  3. Add plugin:"
  echo "     - Path: $(pwd)/dist/openclaw-plugin.js"
  echo "     - Type: Personal Assistant"
  echo ""
  echo "Then say '我喝了500ml水' in OpenClaw to log water!"
  echo ""
}

main() {
  echo ""
  echo "============================================"
  echo -e "${GREEN}🚀 Jiner One-Click Startup${NC}"
  echo "============================================"
  echo ""

  check_node_version
  check_port $JINER_PORT || true
  check_dependencies
  build_project
  start_jiner
  show_guide
}

main "$@"
