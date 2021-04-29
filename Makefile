NPM ?= npm


.PHONY: all
## all: builds and runs the service
all: run

.PHONY: build
## build: build the app
build: node_modules
	$(NPM) run build

.PHONY: run
## run: runs the service
run:# build
	LOCAL=true $(NPM) run start

.PHONY: test
## test: runs all tests
test: node_modules
	$(NPM) run test

.PHONY: lint
## lint: Run eslint and check types
lint: node_modules
	$(NPM) run lint
	$(NPM) run check-types

.PHONY: dist
## dist: creates the bundle file
dist: build
	cp -r node_modules dist;  cd dist; zip -qr js-function *; cp ../src/manifest.json .; cp -r ../static .;  zip -r bundle.zip js-function.zip manifest.json static/

## build: build the app when changed
.PHONY: watch
watch: node_modules
	$(NPM) run build:watch

.PHONY: clean
## clean: deletes all
clean:
	$(NPM) run clean

## node_modules: ensures NPM dependencies are installed without having to run this all the time
node_modules: $(wildcard package.json)
	$(NPM) install
	touch $@

.PHONY: help
## help: prints this help message
help:
	@echo "Usage:"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'
