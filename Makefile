
# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

ROOT := index.js
include $(shell node -e "require('n8-make')")

NODE_MODULES = $(THIS_DIR)/node_modules
BIN := $(NODE_MODULES)/.bin

# applications
NODE ?= node
NPM ?= $(NODE) $(shell which npm)
CHOKI ?= $(BIN)/chokidar

install: node_modules

node_modules: package.json
	@NODE_ENV= $(NPM) install
	@touch node_modules

watch: watch/index.js

watch/index.js:
	$(CHOKI) $(ROOT) -c 'make'

.PHONY: standalone install watch