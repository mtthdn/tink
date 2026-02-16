#!/usr/bin/env bash
# Deploy tink to quique.ca/tink/
#
# Usage: bash ~/tink/deploy.sh
#
# Pushes static files to container 612 (Caddy) via tulip
#
# Prerequisites: SSH access to tulip (172.20.1.10)
# Caddy: quique.ca with /tink/ path matcher serving /var/www/quique.ca/tink/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying to quique.ca/tink/..."
ssh tulip "pct exec 612 -- mkdir -p /var/www/quique.ca/tink/"
for f in index.html game.html; do
    tmp="/tmp/tink_${f}"
    ssh tulip "cat > ${tmp}" < "${SCRIPT_DIR}/${f}"
    ssh tulip "pct push 612 ${tmp} /var/www/quique.ca/tink/${f} && rm ${tmp}"
    echo "  ${f} deployed"
done

echo ""
echo "Live at https://quique.ca/tink/"
echo "  Landing:  https://quique.ca/tink/"
echo "  Game:     https://quique.ca/tink/game.html"
