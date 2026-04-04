#!/bin/sh
DIR="$(cd "$(dirname "$0")/.." && pwd)"
set -a
. "$DIR/.env"
set +a
exec docker run -i --rm -e TRACKER_BOOT_API_KEY public.ecr.aws/tracker-boot/mcp-server:latest
