#!/bin/bash

set -e
   
./scripts/build-wasms-prod.sh

./scripts/build-wasms-dev.sh