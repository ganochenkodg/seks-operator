#!/bin/sh
GOOS=darwin GOARCH=amd64 go build -o sencrypt-osx
GOOS=linux GOARCH=amd64 go build -o sencrypt-linux
