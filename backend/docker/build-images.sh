#!/usr/bin/env bash
# Builds the three sandbox runtime images used by utils/dockerSandbox.js
# (via executeCpp.js, executeC.js, executeJava.js, executePython.js).
#
# Run this once on any machine that will actually execute submissions
# (local dev machine, or the EC2 host) before code execution will work -
# these images are not built automatically by npm install or the app
# startup, since building them requires pulling ~1-2GB of base images.
#
# Requires: Docker installed and the daemon running, with normal internet
# access to Docker Hub (unlike the sandboxed analysis environment this was
# developed in, which cannot reach registry-1.docker.io - see the commit
# message for backend/utils/dockerSandbox.js for details).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Building oj-cpp-runtime (used for both C++ and C)..."
docker build -f docker/cpp.Dockerfile -t oj-cpp-runtime:latest .

echo "Building oj-java-runtime..."
docker build -f docker/java.Dockerfile -t oj-java-runtime:latest .

echo "Building oj-python-runtime..."
docker build -f docker/python.Dockerfile -t oj-python-runtime:latest .

echo "Done. Images:"
docker images | grep -E "oj-(cpp|java|python)-runtime"
