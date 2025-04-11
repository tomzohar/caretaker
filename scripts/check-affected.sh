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

# Use nx print-affected with the --with-deps flag to include projects affected via their dependencies
AFFECTED_OUTPUT=$(npx nx print-affected --base="$BASE" --head="$HEAD" --type=app --with-deps --select=projects --json 2>/dev/null || echo "{}")

# If the command failed or returned empty result, default to deploying both
if [ "$AFFECTED_OUTPUT" = "{}" ]; then
  echo "Could not determine affected apps, defaulting to deploying both"
  DEPLOY_FRONTEND=true
  DEPLOY_BACKEND=true
else
  # Parse the JSON output to check if frontend app is affected
  if echo "$AFFECTED_OUTPUT" | grep -q "\"caretaker-client\""; then
    echo "Frontend app or its dependencies are affected, triggering frontend deployment"
    DEPLOY_FRONTEND=true
  else
    echo "Frontend app and its dependencies are not affected, skipping frontend deployment"
    DEPLOY_FRONTEND=false
  fi

  # Parse the JSON output to check if backend app is affected
  if echo "$AFFECTED_OUTPUT" | grep -q "\"caretaker-backend\""; then
    echo "Backend app or its dependencies are affected, triggering backend deployment"
    DEPLOY_BACKEND=true
  else
    echo "Backend app and its dependencies are not affected, skipping backend deployment"
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