Prereqs
=======

- Minikube, Helm, Docker CLI
- [kubefwd](https://github.com/txn2/kubefwd) for connecting to services locally

Steps
=====

Configure the image with your private key(s) before building:

```
cp ~/.ssh/id_rsa.pub ./openssh-image/authorized-keys/$(whoami)
```

Ensure your cluster context is running:

```
minikube start
```

Ensure that Tiller is running in the cluster. To start Tiller:

```
helm init
```

Ensure your development console is configured to connect to Minikube's docker
daemon:

```
eval $(minikube docker-env)
```

Now you can deploy the helm cluster locally

```
make deploy
```

Now you can start kubefwd in another session (or re-configure docker)

```
sudo kubefwd services
```

And return to your original session to finally connect over SSH!

```
make connect
```

---

<a href='http://www.recurse.com' title='Made with love at the Recurse Center'><img src='https://cloud.githubusercontent.com/assets/2883345/11322973/9e557144-910b-11e5-959a-8fdaaa4a88c5.png' height='14px'/></a>
