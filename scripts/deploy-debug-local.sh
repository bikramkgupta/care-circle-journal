#!/bin/bash
# Deploy debug container locally using doctl
# Requires: .env.secrets file with all secrets

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Load secrets
if [ ! -f .env.secrets ]; then
  echo "Error: .env.secrets file not found"
  exit 1
fi

source .env.secrets

# Check required variables
if [ -z "$SPACES_ACCESS_KEY" ] || [ -z "$SPACES_SECRET_KEY" ] || [ -z "$GRADIENT_API_KEY" ]; then
  echo "Error: Required secrets not found in .env.secrets"
  exit 1
fi

# Use envsubst to inject secrets into app spec
envsubst < .do/app-debug.yaml > .do/app-debug-resolved.yaml

echo "Deploying debug container..."
doctl apps create --spec .do/app-debug-resolved.yaml --format ID,Spec.Name,ActiveDeployment.Phase

# Clean up resolved file
rm -f .do/app-debug-resolved.yaml

echo ""
echo "✅ Debug container deployed!"
echo "Get app ID: doctl apps list | grep care-circle-debug"
echo "Connect: doctl apps console <APP_ID> debug"

