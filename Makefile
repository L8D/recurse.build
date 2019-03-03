export SHELL := /usr/bin/env bash

tag ?= latest
image_names := openssh
image_folders := $(image_names:%=%-image)

.PHONY: all deploy reset FORCE

all: $(image_folders)

FORCE:

deploy: $(image_folders)
	helm install ./openssh-chart \
		--set service.nodePort=32222 \
		--set image=openssh:$(tag)

%-image: FORCE
	docker build -t $*:$(tag) ./$@

reset:
	export RELEASES=$$(helm list -q) && [ ! -z "$$RELEASES" ] && helm delete $$RELEASES || true
