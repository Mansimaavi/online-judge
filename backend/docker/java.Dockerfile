# Sandbox image for Java submissions.
#
# Uses Eclipse Temurin rather than the old `openjdk` Docker Hub image,
# which Docker Hub no longer updates for recent JDK versions.
#
# Build: docker build -f docker/java.Dockerfile -t oj-java-runtime:latest .
FROM eclipse-temurin:21-jdk-jammy

RUN useradd --uid 1000 --create-home --shell /bin/sh sandbox
USER sandbox

WORKDIR /sandbox
