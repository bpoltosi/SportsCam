#!/usr/bin/env bash
set -euo pipefail
INPUT="${1:?recording required}"
EVENT="${2:?event timestamp in seconds required}"
OUTPUT="${3:?output required}"
PRE="${4:-10}"
POST="${5:-10}"
python -m sportscam_runtime.cli replay --input "$INPUT" --event "$EVENT" --pre "$PRE" --post "$POST" --output "$OUTPUT"
