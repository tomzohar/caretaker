# Subnet group for RDS
resource "aws_db_subnet_group" "main" {
  name        = "caretaker-db-subnet-group"
  description = "Database subnet group for Caretaker"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name        = "caretaker-db-subnet-group"
    Environment = var.environment
  }
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier        = "caretaker-db"
  engine            = "postgres"
  engine_version    = "14"
  instance_class    = "db.t3.micro"  # Start small, can scale up later
  allocated_storage = 20

  db_name  = "caretaker"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]

  # Backup configuration
  backup_retention_period = 7
  backup_window          = "03:00-04:00"  # UTC
  maintenance_window     = "Mon:04:00-Mon:05:00"  # UTC

  # Enhanced monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # Performance Insights
  performance_insights_enabled = true
  performance_insights_retention_period = 7  # days

  # Multi-AZ for high availability
  multi_az = true

  # Disable public access
  publicly_accessible = false

  # Enable deletion protection in production
  deletion_protection = true

  # Enable encryption
  storage_encrypted = true

  # Disable auto minor version upgrades (manage them manually)
  auto_minor_version_upgrade = false

  tags = {
    Name        = "caretaker-db"
    Environment = var.environment
  }
}

# IAM role for RDS enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "caretaker-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "caretaker-rds-monitoring-role"
    Environment = var.environment
  }
}

# Attach the AWS managed policy for RDS enhanced monitoring
resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
} 