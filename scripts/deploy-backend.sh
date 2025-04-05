#!/bin/bash

# Exit on error
set -e

# Default values
AWS_REGION=${AWS_REGION:-"us-east-1"}
ECR_REPOSITORY=${ECR_REPOSITORY:-"caretaker-backend"}
ECS_CLUSTER=${ECS_CLUSTER:-"caretaker-cluster"} 
ECS_SERVICE=${ECS_SERVICE:-"caretaker-backend"}
IMAGE_TAG=${IMAGE_TAG:-$(git rev-parse --short HEAD)}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --region)
      AWS_REGION="$2"
      shift 2
      ;;
    --build-only)
      BUILD_ONLY=true
      shift
      ;;
    --push-only)
      PUSH_ONLY=true
      shift
      ;;
    --deploy-only)
      DEPLOY_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Deploying with the following configuration:"
echo "AWS Region: $AWS_REGION"
echo "ECR Repository: $ECR_REPOSITORY"
echo "ECS Cluster: $ECS_CLUSTER"
echo "ECS Service: $ECS_SERVICE"
echo "Image Tag: $IMAGE_TAG"

# Get the AWS account ID
if [ -z "$PUSH_ONLY" ] && [ -z "$DEPLOY_ONLY" ]; then
  # Build the application
  echo "Building the application..."
  npm run build
fi

if [ -z "$DEPLOY_ONLY" ]; then
  # Get ECR registry URL
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
  
  if [ -z "$PUSH_ONLY" ]; then
    # Build Docker image
    echo "Building Docker image..."
    docker build -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG} .
  fi
  
  # Log in to ECR
  echo "Logging in to Amazon ECR..."
  aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
  
  # Push Docker image
  echo "Pushing Docker image to ECR..."
  docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
  
  # Tag as latest and push
  echo "Tagging and pushing as latest..."
  docker tag ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest
  docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest
fi

if [ -z "$BUILD_ONLY" ] && [ -z "$PUSH_ONLY" ]; then
  # Update ECS service
  echo "Updating ECS service..."
  aws ecs update-service --cluster ${ECS_CLUSTER} \
                         --service ${ECS_SERVICE} \
                         --force-new-deployment \
                         --region ${AWS_REGION}
  
  echo "Deployment initiated! Check AWS console for progress."
fi

if [ -n "$BUILD_ONLY" ]; then
  echo "Build completed. Image not pushed or deployed as --build-only was specified."
elif [ -n "$PUSH_ONLY" ]; then
  echo "Image pushed to ECR. Service not updated as --push-only was specified."
elif [ -n "$DEPLOY_ONLY" ]; then
  echo "ECS service updated. Build and push steps skipped as --deploy-only was specified."
else
  echo "Full deployment completed!"
fi 