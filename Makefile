export SHELL := /usr/bin/env bash

tag ?= latest
image_names := openssh worker users-authorized-keys-fs-consumer
image_folders := $(image_names:%=%-image)

.PHONY: all logs attach-sh deploy connect FORCE images

all: images
	
images: $(image_folders)

FORCE:

logs:
	export POD=$$(kubectl get pods -ojsonpath='{.items[].metadata.name}') \
		&& [ ! -z "$$POD" ] \
		&& kubectl logs $$POD

attach-sh:
	export POD=$$(kubectl get pods -ojsonpath='{.items[].metadata.name}') \
		&& [ ! -z "$$POD" ] \
		&& kubectl exec -it $$POD sh

deploy-redis:
	helm install --name rcci-db -f values.yaml stable/redis

redeploy: $(image_folders)
	helm upgrade local-recurse-dot-build ./rcci \
		--set openssh.service.nodePort=32222 \
		--set openssh.image=openssh:$(tag)

deploy: $(image_folders)
	[ ! -z "$$(helm ls local-recurse-dot-build)" ] \
		&& helm delete local-recurse-dot-build \
		|| true
	helm install ./rcci \
		--replace \
		-n local-recurse-dot-build \
		--set openssh.service.nodePort=32222 \
		--set openssh.image=openssh:$(tag)

connect:
	ssh local-recurse-dot-build-rcci-git

%-image: FORCE
	docker build -t $*:$(tag) ./$@
