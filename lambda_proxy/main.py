import os
import boto3
import requests
import random
import base64

servicediscovery = boto3.client('servicediscovery')

def handler(event, context):
    # Discover healthy instances from Cloud Map
    response = servicediscovery.discover_instances(
        NamespaceName=os.environ['NAMESPACE_NAME'],
        ServiceName=os.environ['SERVICE_NAME'],
        HealthStatus='HEALTHY'
    )

    if not response['Instances']:
        return {
            'statusCode': 503,
            'body': 'Service Unavailable: No healthy instances found.'
        }

    # Choose a random healthy instance
    instance = random.choice(response['Instances'])
    instance_ip = instance['Attributes']['AWS_INSTANCE_IPV4']
    
    # Reconstruct the URL for the backend service
    backend_url = f"http://{instance_ip}:8000{event['rawPath']}"
    
    # Handle query string parameters
    if 'queryStringParameters' in event and event['queryStringParameters']:
        query_params = "&".join([f"{k}={v}" for k, v in event['queryStringParameters'].items()])
        backend_url += f"?{query_params}"

    # Forward the request
    method = event['requestContext']['http']['method']
    headers = event['headers']
    
    # The body from API Gateway is base64 encoded if it's not empty
    body = event.get('body')
    if body:
        if event.get('isBase64Encoded', False):
            body = base64.b64decode(body)

    try:
        resp = requests.request(
            method,
            backend_url,
            headers=headers,
            data=body,
            timeout=10 # 10 second timeout
        )

        # Return the response from the backend service
        return {
            'statusCode': resp.status_code,
            'headers': dict(resp.headers),
            'body': resp.text
        }
    except requests.exceptions.RequestException as e:
        print(f"Error forwarding request: {e}")
        return {
            'statusCode': 500,
            'body': 'Internal Server Error: Failed to connect to backend service.'
        }
