#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Check required environment variables
if [ -z "$AWS_CARETAKER_CLIENT_BUCKET_NAME" ]; then
    echo "Error: AWS_CARETAKER_CLIENT_BUCKET_NAME is not set"
    exit 1
fi

if [ -z "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "Error: AWS_CLOUDFRONT_DISTRIBUTION_ID is not set"
    exit 1
fi

echo "🏗️  Building frontend application..."
nx run caretaker-client:build

echo "📤 Deploying to S3..."
aws s3 sync dist/apps/caretaker-client "s3://$AWS_CARETAKER_CLIENT_BUCKET_NAME"

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution "$AWS_CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"

echo "✅ Frontend deployment completed!" 