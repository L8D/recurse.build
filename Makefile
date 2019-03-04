export SHELL := /usr/bin/env bash

tag ?= latest
image_names := openssh
image_folders := $(image_names:%=%-image)

.PHONY: all logs attach-sh deploy test connect reset FORCE

all: $(image_folders)

FORCE:

logs:
	export POD=$$(kubectl get pods -ojsonpath='{.items[].metadata.name}') \
		&& [ ! -z "$$POD" ] \
		&& kubectl logs $$POD

attach-sh:
	export POD=$$(kubectl get pods -ojsonpath='{.items[].metadata.name}') \
		&& [ ! -z "$$POD" ] \
		&& kubectl exec -it $$POD sh

deploy: $(image_folders)
	helm install ./openssh-chart \
		--set service.nodePort=32222 \
		--set image=openssh:$(tag)

test: reset deploy
	sleep 5 && $(MAKE) connect

connect:
	ssh -v -p 32222 $(shell minikube ip) -i ~/.ssh/k8s_rsa

%-image: FORCE
	docker build -t $*:$(tag) ./$@

reset:
	export RELEASES=$$(helm list -q) && [ ! -z "$$RELEASES" ] && helm delete $$RELEASES || true
