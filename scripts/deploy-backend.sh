#!/bin/bash

# Exit on error
set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="caretaker-backend"
ECS_CLUSTER="caretaker-cluster"
ECS_SERVICE="caretaker-backend"

# Get ECR login password and login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 127214163285.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the application
echo "Building the application..."
nx build caretaker-backend --configuration=production

# Build and tag Docker image
echo "Building Docker image..."
docker build -t $ECR_REPOSITORY .
docker tag $ECR_REPOSITORY:latest 127214163285.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Push to ECR
echo "Pushing to ECR..."
docker push 127214163285.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Update ECS service
echo "Updating ECS service..."
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment

echo "Deployment completed!" 