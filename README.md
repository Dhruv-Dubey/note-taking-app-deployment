# note-taking-app-deployment
# Deploying and Managing a Scalable Web Application Using Kubernetes

## Table of Contents
1. [Introduction]
2. [Prerequisites]
3. [Setting up Kubernetes Cluster]
4. [Containerizing the Application]
5. [Deploying to Kubernetes]
6. [Configuring Auto-scaling]
7. [Implementing Persistent Storage]
8. [Rolling Updates & Rollbacks]
9. [Testing the Deployment]
10. [Deliverables]

## Introduction
This project involves deploying a scalable web application using Kubernetes with Minikube. The application is containerized with Docker and deployed using Kubernetes manifests, supporting auto-scaling, persistent storage, and rolling updates.

## Prerequisites
- Installed Minikube 
- Installed kubectl 
- Installed Docker 
- Docker Desktop

## Setting up Kubernetes Cluster
```sh
minikube start --nodes 2
kubectl get nodes
```
Expected Output: Two worker nodes should be running.

## Containerizing the Application
1. Create a `Dockerfile`:
```Dockerfile
FROM node:14
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
EXPOSE 8080
```
2. Build and push the image:
```sh
docker build -t <your-dockerhub-username>/webapp:v1 .
docker push <your-dockerhub-username>/webapp:v1
```

## Deploying to Kubernetes
1. Create a `deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: <your-dockerhub-username>/webapp:v1
        ports:
        - containerPort: 8080
```
2. Apply the deployment:
```sh
kubectl apply -f deployment.yaml
kubectl get deployments
```
3. Create a `service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: NodePort
  selector:
    app: webapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```
4. Apply the service:
```sh
kubectl apply -f service.yaml
kubectl get services
```
5. Get the application URL:
```sh
minikube service webapp-service --url
```

## Configuring Auto-scaling
1. Create an `hpa.yaml`:
```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp-deployment
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```
2. Apply the HPA:
```sh
kubectl apply -f hpa.yaml
kubectl get hpa
```

## Implementing Persistent Storage (Optional)
1. Create a `pv.yaml`:
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: webapp-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
```
2. Create a `pvc.yaml`:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: webapp-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```
3. Apply PV and PVC:
```sh
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
```

## Rolling Updates & Rollbacks
1. Update the deployment:
```sh
kubectl set image deployment/webapp-deployment webapp=<your-dockerhub-username>/webapp:v2
```
2. Rollback if needed:
```sh
kubectl rollout undo deployment/webapp-deployment
```

## Testing the Deployment
### 1. Application Availability
```sh
kubectl get services
curl http://<EXTERNAL-IP>:<PORT>
```
Expected: Returns homepage/API response.

### 2. Scaling Test
```sh
kubectl get hpa
kubectl run --rm -it --image=busybox stress-test -- /bin/sh
while true; do wget -q -O- http://<SERVICE-IP>:<PORT>; done
```
Expected: Pods should increase dynamically.

### 3. Rolling Update & Rollback
```sh
kubectl set image deployment/webapp-deployment webapp=newimage:v2
kubectl rollout undo deployment/webapp-deployment
```
Expected: Smooth upgrade/downgrade.

### 4. Pod Failure & Self-Healing
```sh
kubectl delete pod <POD_NAME>
kubectl get pods -w
```
Expected: A new pod should be created.

### 5. Persistent Storage (If Implemented)
```sh
kubectl delete pod <POD_NAME>
kubectl get pods -w
```
Expected: Data persists after restart.

### 6. Logging Test
```sh
kubectl logs <POD_NAME>
```
Expected: Displays application logs.




