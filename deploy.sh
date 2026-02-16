#!/usr/bin/env bash
# Deploy tink to tink.quique.ca
#
# Usage: bash ~/tink/deploy.sh
#
# Pushes static files to container 612 (Caddy) via tulip
#
# Prerequisites: SSH access to tulip (172.20.1.10)
# DNS: tink.quique.ca CNAME to Cloudflare tunnel
# Caddy: tink.quique.ca site block serving /var/www/quique.ca/tink/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying to tink.quique.ca..."
ssh tulip "pct exec 612 -- mkdir -p /var/www/quique.ca/tink/"
for f in index.html; do
    tmp="/tmp/tink_${f}"
    ssh tulip "cat > ${tmp}" < "${SCRIPT_DIR}/${f}"
    ssh tulip "pct push 612 ${tmp} /var/www/quique.ca/tink/${f} && rm ${tmp}"
    echo "  ${f} deployed"
done

echo ""
echo "Live at https://tink.quique.ca/"
