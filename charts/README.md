# Traveloop Helm Chart

This is a minimal Helm chart for deploying the Traveloop app.

## Features
- Deploys the Traveloop container
- Exposes port 3000 via Service
- Optional persistent storage for `/app/data` and `/app/uploads`
- Configurable environment variables and secrets
- Optional generic Ingress support
- Health checks on `/api/health`

## Usage

Install directly from the local chart:

```sh
helm install traveloop ./chart \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=yourdomain.com
```

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Container image | `traveloop/app` |
| `image.tag` | Image tag | `latest` |
| `service.port` | Service port | `3000` |
| `ingress.enabled` | Enable ingress | `false` |
| `persistence.enabled` | Enable PVC | `false` |
| `persistence.size` | Storage size | `5Gi` |
| `env.NODE_ENV` | Runtime mode | `production` |

## Example values.yaml

```yaml
image:
  repository: traveloop/app
  tag: latest

service:
  port: 3000

ingress:
  enabled: true
  hosts:
    - host: traveloop.yourdomain.com
      paths:
        - path: /
          pathType: Prefix

persistence:
  enabled: true
  size: 10Gi

env:
  NODE_ENV: production
  JWT_SECRET: your-secret-here
```
