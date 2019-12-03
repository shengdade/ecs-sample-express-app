import cdk = require('@aws-cdk/core');
import ecr = require('@aws-cdk/aws-ecr');
import ecs = require('@aws-cdk/aws-ecs');
import ec2 = require('@aws-cdk/aws-ec2');
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns');

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR repository
    const repository = new ecr.Repository(this, 'sample-express-app', {
      repositoryName: 'sample-express-app'
    });

    // ECS cluster/resources
    const cluster = new ecs.Cluster(this, 'app-cluster', {
      clusterName: 'app-cluster'
    });

    cluster.addCapacity('app-scaling-group', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1
    });

    const loadBalancedService = new ecsPatterns.ApplicationLoadBalancedEc2Service(
      this,
      'app-service',
      {
        cluster,
        memoryLimitMiB: 512,
        cpu: 5,
        desiredCount: 1,
        serviceName: 'sample-express-app',
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(repository),
          containerPort: 8080
        },
        publicLoadBalancer: true
      }
    );
  }
}
