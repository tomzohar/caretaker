# Subnet group for Redis
resource "aws_elasticache_subnet_group" "main" {
  name        = "caretaker-redis-subnet-group"
  description = "Redis subnet group for Caretaker"
  subnet_ids  = aws_subnet.private[*].id
}

# Parameter group for Redis
resource "aws_elasticache_parameter_group" "redis" {
  family = "redis7"
  name   = "caretaker-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

# Redis cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "caretaker-redis"
  engine              = "redis"
  node_type           = "cache.t3.micro"  # Start small, can scale up later
  num_cache_nodes     = 1
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  port                = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  # Backup configuration
  snapshot_retention_limit = 7
  snapshot_window         = "05:00-06:00"  # UTC
  maintenance_window      = "Mon:06:00-Mon:07:00"  # UTC

  # Enable encryption in transit
  transit_encryption_enabled = false

  tags = {
    Name        = "caretaker-redis"
    Environment = var.environment
  }
} 