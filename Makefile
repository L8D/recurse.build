export SHELL := /usr/bin/env bash

tag ?= latest
image_names := openssh
image_folders := $(image_names:%=%-image)

.PHONY: all logs attach-sh deploy connect FORCE

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
	[ ! -z "$$(helm ls local-recurse-dot-build)" ] \
		&& helm delete local-recurse-dot-build \
		|| true
	helm install ./openssh-chart \
		--replace \
		-n local-recurse-dot-build \
		--set service.nodePort=32222 \
		--set image=openssh:$(tag)

connect:
	ssh local-recurse-dot-build-openssh-chart

%-image: FORCE
	docker build -t $*:$(tag) ./$@
