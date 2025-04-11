#!/bin/bash

# Exit on error
set -e

# Default values
AWS_CARETAKER_CLIENT_BUCKET_NAME=${AWS_CARETAKER_CLIENT_BUCKET_NAME:-""}
AWS_CLOUDFRONT_DISTRIBUTION_ID=${AWS_CLOUDFRONT_DISTRIBUTION_ID:-""}
BUILD_ONLY=false
DEPLOY_ONLY=false
SKIP_INVALIDATION=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --bucket)
      AWS_CARETAKER_CLIENT_BUCKET_NAME="$2"
      shift 2
      ;;
    --distribution)
      AWS_CLOUDFRONT_DISTRIBUTION_ID="$2"
      shift 2
      ;;
    --build-only)
      BUILD_ONLY=true
      shift
      ;;
    --deploy-only)
      DEPLOY_ONLY=true
      shift
      ;;
    --skip-invalidation)
      SKIP_INVALIDATION=true
      shift
      ;;
    --help)
      echo "Usage: deploy-frontend.sh [options]"
      echo "Options:"
      echo "  --bucket NAME         Set S3 bucket name"
      echo "  --distribution ID     Set CloudFront distribution ID"
      echo "  --build-only          Only build the application, don't deploy"
      echo "  --deploy-only         Only deploy, don't build"
      echo "  --skip-invalidation   Skip CloudFront cache invalidation"
      echo "  --help                Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run deploy-frontend.sh --help for usage information"
      exit 1
      ;;
  esac
done

# Load environment variables from .env if present
if [ -f .env ]; then
    source .env
fi

# Check required environment variables
if [ -z "$AWS_CARETAKER_CLIENT_BUCKET_NAME" ]; then
    echo "Error: AWS_CARETAKER_CLIENT_BUCKET_NAME is not set"
    echo "Please set it in the environment or use --bucket option"
    exit 1
fi

if [ -z "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$SKIP_INVALIDATION" != "true" ]; then
    echo "Warning: AWS_CLOUDFRONT_DISTRIBUTION_ID is not set"
    echo "CloudFront cache invalidation will be skipped"
    SKIP_INVALIDATION=true
fi

echo "Deploying frontend with the following configuration:"
echo "S3 Bucket: $AWS_CARETAKER_CLIENT_BUCKET_NAME"
echo "CloudFront Distribution: $AWS_CLOUDFRONT_DISTRIBUTION_ID"
echo "Build Only: $BUILD_ONLY"
echo "Deploy Only: $DEPLOY_ONLY"
echo "Skip Invalidation: $SKIP_INVALIDATION"

# Build the application
if [ "$DEPLOY_ONLY" != "true" ]; then
    echo "🏗️  Building frontend application..."
    npx nx run caretaker-client:build
fi

# Deploy to S3
if [ "$BUILD_ONLY" != "true" ]; then
    echo "📤 Deploying to S3..."
    aws s3 sync dist/apps/caretaker-client "s3://$AWS_CARETAKER_CLIENT_BUCKET_NAME" --delete
    
    # Invalidate CloudFront cache
    if [ "$SKIP_INVALIDATION" != "true" ]; then
        echo "🔄 Invalidating CloudFront cache..."
        aws cloudfront create-invalidation --distribution "$AWS_CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"
    fi
fi

# Print completion message
if [ "$BUILD_ONLY" = "true" ]; then
    echo "✅ Frontend build completed! Not deployed as --build-only was specified."
elif [ "$DEPLOY_ONLY" = "true" ]; then
    echo "✅ Frontend deployment completed! Build was skipped as --deploy-only was specified."
else
    echo "✅ Frontend build and deployment completed!"
fi 