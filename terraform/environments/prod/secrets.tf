# Application secrets
resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "caretaker/jwt-secret"
  tags = {
    Name = "caretaker-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
} 