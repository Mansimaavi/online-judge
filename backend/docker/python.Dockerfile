# Sandbox image for Python submissions.
#
# Build: docker build -f docker/python.Dockerfile -t oj-python-runtime:latest .
FROM python:3.12-slim

RUN useradd --uid 1000 --create-home --shell /bin/sh sandbox
USER sandbox

WORKDIR /sandbox
