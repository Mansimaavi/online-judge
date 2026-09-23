# Sandbox image for C and C++ submissions. Used for both languages since
# the official gcc image ships both gcc and g++.
#
# Build: docker build -f docker/cpp.Dockerfile -t oj-cpp-runtime:latest .
FROM gcc:13-bookworm

# Run as a non-root user. The container's root filesystem is mounted
# read-only at runtime (see utils/dockerSandbox.js) and network access is
# disabled, so this user has no meaningful privileges beyond the one
# bind-mounted /sandbox directory it's given per submission.
RUN useradd --uid 1000 --create-home --shell /bin/sh sandbox
USER sandbox

WORKDIR /sandbox
