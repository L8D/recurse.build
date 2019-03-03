export SHELL := /usr/bin/env bash

tag ?= latest
image_names := openssh
image_folders := $(image_names:%=%-image)

.PHONY: all deploy test reset FORCE

all: $(image_folders)

FORCE:

deploy: $(image_folders)
	helm install ./openssh-chart \
		--set service.nodePort=32222 \
		--set image=openssh:$(tag)

test: reset deploy
	sleep 5
	ssh -p 32222 $(shell minikube ip)

%-image: FORCE
	docker build -t $*:$(tag) ./$@

reset:
	export RELEASES=$$(helm list -q) && [ ! -z "$$RELEASES" ] && helm delete $$RELEASES || true
