#!/usr/bin/env bash
set -euo pipefail
python -m sportscam_runtime.cli replay --input "$1" --event "$2" --output "$3" --pre "${4:-10}" --post "${5:-10}"
