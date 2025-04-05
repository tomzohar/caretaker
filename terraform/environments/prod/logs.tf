resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/caretaker-backend"
  retention_in_days = 14

  tags = {
    Name = "caretaker-backend-logs"
  }
} 