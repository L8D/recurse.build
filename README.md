Prereqs
=======

- Minikube, Helm, Docker CLI

Steps
=====

```
cp ~/.ssh/id_rsa.pub ./openssh-image/authorized-keys/$(whoami)
minikube start
helm init
eval $(minikube docker-env)
make deploy
make connect
```
