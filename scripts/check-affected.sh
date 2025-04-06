#!/bin/bash

# This script checks which apps are affected by changes and determines what should be deployed

set -e

# Get the base commit for comparison
if [ -n "$GITHUB_BASE_REF" ]; then
  # In a GitHub PR context
  BASE="origin/$GITHUB_BASE_REF"
  HEAD="HEAD"
elif [ -n "$NX_BASE" ]; then
  # Explicit base provided
  BASE="$NX_BASE"
  HEAD="${NX_HEAD:-HEAD}"
else
  # Default to comparing with the previous commit
  BASE=$(git rev-parse HEAD~1)
  HEAD="HEAD"
fi

echo "Checking affected apps between $BASE and $HEAD..."

# Run nx affected:apps to get the list of affected apps
AFFECTED_APPS=$(npx nx affected:apps --base="$BASE" --head="$HEAD" 2>/dev/null || echo "")

# If the affected apps command failed, default to deploying both
if [ -z "$AFFECTED_APPS" ]; then
  echo "Could not determine affected apps, defaulting to deploying both"
  DEPLOY_FRONTEND=true
  DEPLOY_BACKEND=true
else
  # Check if the frontend app is affected
  if echo "$AFFECTED_APPS" | grep -q "caretaker-client"; then
    echo "Frontend app is affected, triggering frontend deployment"
    DEPLOY_FRONTEND=true
  else
    echo "Frontend app is not affected, skipping frontend deployment"
    DEPLOY_FRONTEND=false
  fi

  # Check if the backend app is affected
  if echo "$AFFECTED_APPS" | grep -q "caretaker-backend"; then
    echo "Backend app is affected, triggering backend deployment"
    DEPLOY_BACKEND=true
  else
    echo "Backend app is not affected, skipping backend deployment"
    DEPLOY_BACKEND=false
  fi
fi

# Export the results based on environment
if [ -n "$GITHUB_ENV" ]; then
  # We're in GitHub Actions
  echo "DEPLOY_FRONTEND=$DEPLOY_FRONTEND" >> "$GITHUB_ENV"
  echo "DEPLOY_BACKEND=$DEPLOY_BACKEND" >> "$GITHUB_ENV"
fi

if [ -n "$GITHUB_OUTPUT" ]; then
  # We're in a GitHub Actions output-capturing context
  echo "DEPLOY_FRONTEND=$DEPLOY_FRONTEND" >> "$GITHUB_OUTPUT"
  echo "DEPLOY_BACKEND=$DEPLOY_BACKEND" >> "$GITHUB_OUTPUT"
fi

# For local use, also output the results
echo "Deployment decisions:"
echo "  DEPLOY_FRONTEND=$DEPLOY_FRONTEND"
echo "  DEPLOY_BACKEND=$DEPLOY_BACKEND"

# Return values for programmatic use
export DEPLOY_FRONTEND
export DEPLOY_BACKEND 