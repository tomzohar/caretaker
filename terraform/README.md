# Caretaker Infrastructure

This directory contains the Terraform configurations for the Caretaker application infrastructure.

## Environment Structure

```
terraform/
├── environments/
│   └── prod/           # Production environment
│       ├── alb.tf      # Application Load Balancer configuration
│       ├── ecs.tf      # ECS cluster and service configuration
│       ├── ecr.tf      # Container registry
│       ├── database.tf # RDS configuration
│       ├── redis.tf    # Redis configuration
│       └── ...
```

## Key Components

- **Frontend**: Static website hosted on S3 with CloudFront distribution
- **Backend**: ECS Fargate service running Node.js application
- **Database**: RDS PostgreSQL instance
- **Cache**: ElastiCache Redis cluster
- **Load Balancer**: Application Load Balancer with SSL termination
- **DNS**: Route53 for domain management

## Common Operations

### Deploying Infrastructure Changes

1. Navigate to the environment directory:
   ```bash
   cd terraform/environments/prod
   ```

2. Review changes:
   ```bash
   terraform plan
   ```

3. Apply changes:
   ```bash
   terraform apply
   ```

### Adding New Infrastructure Components

1. Create a new `.tf` file for the component
2. Document the purpose in the file header
3. Add any new variables to `variables.tf`
4. Add any new outputs to `outputs.tf`

### CI/CD Integration

The infrastructure supports automated deployments through GitHub Actions:

- Frontend: Automatic deployment to S3 on merge to main
- Backend: Docker image build and ECS deployment on merge to main

## Security Considerations

- SSL certificates are managed through ACM
- Secrets are stored in AWS Secrets Manager
- Network security follows AWS best practices with VPC isolation

## Maintenance Procedures

### Regular Tasks

- Monitor CloudWatch logs and metrics
- Review security group rules
- Check SSL certificate expiration
- Verify backup retention policies

### Backup and Recovery

- Database: Automated daily snapshots with 7-day retention
- Application state: Stored in RDS and Redis
- Infrastructure state: Terraform state stored locally (TODO: migrate to S3 backend)

## Cost Management

Key billable components:
- ECS Fargate tasks
- RDS instance
- ElastiCache node
- ALB and data transfer
- S3 and CloudFront usage

## Future Improvements

- [ ] Migrate Terraform state to S3 backend with DynamoDB locking
- [ ] Add staging environment
- [ ] Implement auto-scaling policies
- [ ] Set up monitoring and alerting
- [ ] Add disaster recovery procedures 