
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
WEBPACK ?= $(NODE) $(BIN)/webpack
MOCHA ?= $(NODE) $(BIN)/mocha
CHOKI ?= $(BIN)/chokidar
SERVE = $(BIN)/serve

# create standalone bundle for testing purpose
standalone: build build/wpcom-xhr-request.js

build/wpcom-xhr-request.js:
	@$(WEBPACK) -p --config ./examples/webpack.config.js

install: node_modules

node_modules: package.json
	@NODE_ENV= $(NPM) install
	@touch node_modules

watch: watch/index.js

watch/index.js:
	$(CHOKI) $(ROOT) -c 'make'

test:
	@$(MOCHA) \
		--timeout 120s \
		--slow 3s \
		--grep "$(FILTER)" \
		--bail \
		--reporter spec \
		--compilers js:babel-register \
		test/

test-watch:
	@$(MOCHA) \
		--timeout 120s \
		--slow 3s \
		--grep "$(FILTER)" \
		--bail \
		--watch \
		--reporter spec \
		--compilers js:babel-register \
		test/

examples: standalone
	$(SERVE) -p 3002

.PHONY: standalone install watch test