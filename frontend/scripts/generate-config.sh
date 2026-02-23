#!/bin/bash
# Generate config.js from environment variable at build time

BACKEND_URL="${REACT_APP_BACKEND_URL:-https://masalla-production.up.railway.app}"

cat > public/config.js << EOF
// Runtime configuration - Generated at build time
window.ENV = {
  REACT_APP_BACKEND_URL: "${BACKEND_URL}"
};
EOF

echo "Generated config.js with BACKEND_URL: ${BACKEND_URL}"
