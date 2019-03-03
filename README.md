Prereqs
=======

- Minikube, Helm, Docker CLI

Steps
=====

```
minikube start
helm init
eval $(minikube docker-env)
docker build -t openssh:latest ./openssh-image
helm install ./openssh-chart
```
