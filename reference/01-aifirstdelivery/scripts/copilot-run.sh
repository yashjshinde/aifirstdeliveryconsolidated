#!/usr/bin/env bash
# Generates a self-contained GitHub Copilot prompt for any AI First Delivery agent command.
# The prompt is written to .tmp/copilot-prompt.md and copied to clipboard where available.
#
# Usage:
#   ./scripts/copilot-run.sh <domain> <command> <feature>
#
# Examples:
#   ./scripts/copilot-run.sh d365-ce spec customer-loyalty-points
#   ./scripts/copilot-run.sh d365-ce review customer-loyalty-points
#   ./scripts/copilot-run.sh data-migration spec sftp-to-dv-accounts

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <command> [feature]}"
COMMAND="${2:?Usage: $0 <domain> <command> [feature]}"
FEATURE="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
RUNNER_DIR="$ROOT_DIR/tools/runner"
RUNNER_SCRIPT="$RUNNER_DIR/run-agent.js"
OUT_DIR="$ROOT_DIR/.tmp"
OUT_FILE="$OUT_DIR/copilot-prompt.md"

# Auto-install runner dependencies on first run
if [ ! -d "$RUNNER_DIR/node_modules" ]; then
    echo "First run — installing runner dependencies ..."
    (cd "$RUNNER_DIR" && npm install --silent)
fi

# Ensure .tmp output folder exists
mkdir -p "$OUT_DIR"

# Build args
ARGS=("$DOMAIN" "$COMMAND")
[ -n "$FEATURE" ] && ARGS+=("$FEATURE")
ARGS+=("--output-prompt" "$OUT_FILE")

echo ""
echo "Generating prompt: [$DOMAIN] /$COMMAND${FEATURE:+ $FEATURE}"

node "$RUNNER_SCRIPT" "${ARGS[@]}"

# Copy to clipboard (cross-platform)
if command -v pbcopy &>/dev/null; then
    pbcopy < "$OUT_FILE"
    CLIP_MSG="Copied to clipboard (pbcopy)"
elif command -v xclip &>/dev/null; then
    xclip -selection clipboard < "$OUT_FILE"
    CLIP_MSG="Copied to clipboard (xclip)"
elif command -v clip.exe &>/dev/null; then
    clip.exe < "$OUT_FILE"
    CLIP_MSG="Copied to clipboard (clip.exe)"
else
    CLIP_MSG="Clipboard not available — open $OUT_FILE manually"
fi

SIZE_KB=$(du -k "$OUT_FILE" | cut -f1)

echo ""
echo "  Prompt ready  (${SIZE_KB} KB)"
echo "  File:         $OUT_FILE"
echo "  Clipboard:    $CLIP_MSG"
echo ""
echo "Next steps:"
echo "  1. Open Copilot Chat    Ctrl+Alt+I  (or View > Chat)"
echo "  2. Switch to Agent mode click the  *  icon (not Ask / Edit)"
echo "  3. Paste                Ctrl+V"
echo "  4. Press Enter and follow Copilot's prompts"
echo ""
