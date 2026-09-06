#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist/css dist/js
cp index.html nihar_dwivedi_resume.pdf og.png og-synthwave.png dist/
cp css/styles.css dist/css/
cp js/pages.js dist/js/
if [ -d posts ]; then cp -R posts dist/; fi
