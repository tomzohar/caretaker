#!/bin/bash

# Exit on error
set -e

# Configuration
AWS_REGION="us-east-1"
ECS_CLUSTER="caretaker-cluster"
ECS_SERVICE="caretaker-backend"

# Check service status
echo "Checking ECS service status..."
aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --query 'services[0].{status: status, desiredCount: desiredCount, runningCount: runningCount, pendingCount: pendingCount, deployments: deployments[0].{status: status, desiredCount: desiredCount, runningCount: runningCount, pendingCount: pendingCount, rolloutState: rolloutState, rolloutStateReason: rolloutStateReason}}' \
    --output table

# Get the latest task ARN
TASK_ARN=$(aws ecs list-tasks \
    --cluster $ECS_CLUSTER \
    --service-name $ECS_SERVICE \
    --query 'taskArns[0]' \
    --output text)

if [ "$TASK_ARN" != "None" ]; then
    echo -e "\nChecking latest task status..."
    aws ecs describe-tasks \
        --cluster $ECS_CLUSTER \
        --tasks $TASK_ARN \
        --query 'tasks[0].{status: lastStatus, health: healthStatus, reason: stoppedReason}' \
        --output table

    # Get the latest logs
    TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
    echo -e "\nLatest logs:"
    aws logs get-log-events \
        --log-group-name /ecs/caretaker-backend \
        --log-stream-name "ecs/caretaker-backend/$TASK_ID" \
        --limit 10 \
        --query 'events[*].[timestamp,message]' \
        --output text
else
    echo "No tasks found running"
fi 