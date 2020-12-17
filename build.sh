#!/bin/bash

docker build -t docker.pkg.github.com/khonkaen-hospital/donate-backend/donate-api .
docker push docker.pkg.github.com/khonkaen-hospital/donate-backend/donate-api
