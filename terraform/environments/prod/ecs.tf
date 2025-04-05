# ECS Configuration for Caretaker Backend
#
# This file defines the ECS cluster and service configurations for the Caretaker backend application.
# 
# Resources:
# - ECS Cluster: Fargate cluster for running containerized applications
# - ECS Task Definition: Container configuration and resource requirements
# - ECS Service: Service configuration including desired count and networking
#
# Dependencies:
# - VPC and subnets (main.tf)
# - Security groups (security.tf)
# - Load balancer target group (alb.tf)
# - ECR repository (ecr.tf)
#
# Last Updated: 2024-04-05
# Changes:
# - Added health check configuration
# - Updated container port to 3333
# - Added CloudWatch logging

resource "aws_ecs_cluster" "caretaker_cluster" {
  name = "caretaker-cluster"
  tags = {
    Name = "caretaker-cluster"
  }
}

resource "aws_ecs_task_definition" "caretaker_task" {
  family                   = "caretaker-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn
  container_definitions    = jsonencode([
    {
      name      = "caretaker-backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3333
          hostPort      = 3333
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "3333"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/caretaker"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.cache_nodes[0].port}"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/caretaker-backend"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
  tags = {
    Name = "caretaker-task"
  }
}

# IAM role for ECS tasks to access AWS services
resource "aws_iam_role" "ecs_task_role" {
  name = "caretaker-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Policy to allow ECS tasks to access Secrets Manager
resource "aws_iam_role_policy" "ecs_task_secrets_policy" {
  name = "secrets-access"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.jwt_secret.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "caretaker-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "caretaker-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_service" "backend" {
  name            = "caretaker-backend"
  cluster         = aws_ecs_cluster.caretaker_cluster.id
  task_definition = aws_ecs_task_definition.caretaker_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [for subnet in aws_subnet.private : subnet.id]
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "caretaker-backend"
    container_port   = 3333
  }

  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "caretaker-backend-service"
  }
}

# Add DNS record for the API
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.backend.dns_name
    zone_id                = aws_lb.backend.zone_id
    evaluate_target_health = true
  }
} 