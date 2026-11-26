#!/usr/bin/env bash
# Pre-release checks. Run from the repository root before tagging.
#   scripts/check_release.sh v2.0.0
set -uo pipefail
TAG="${1:?usage: check_release.sh <tag>}"; fail=0
bad() { echo "FAIL: $*"; fail=1; }
ok()  { echo "ok:   $*"; }

[[ -z "$(git status --porcelain)" ]] && ok "working tree clean" || bad "uncommitted changes"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && bad "tag $TAG already exists" || ok "tag $TAG is free"

# Secrets: gitleaks if installed (brew install gitleaks), else simple patterns.
if command -v gitleaks >/dev/null; then
  gitleaks detect --no-git --redact -s . >/dev/null 2>&1 && ok "gitleaks: no secrets" || bad "gitleaks found secrets (run: gitleaks detect --no-git -s . -v)"
else
  hits="$(git grep -n -I -E 'alchemy\.com/v2/[A-Za-z0-9_-]{16,}|infura\.io/v3/[a-f0-9]{32}|(api[_-]?key|secret|password|token)["'\'' ]*[:=]["'\'' ]*[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|0x[a-fA-F0-9]{64}"' -- ':!*.csv' ':!datasets/*' ':!data/*' 2>/dev/null)"
  [[ -z "$hits" ]] && ok "no secret patterns" || { bad "possible secrets:"; echo "$hits" | cut -c1-160; }
fi
git ls-files | grep -E '(^|/)\.env$|experiments\.env$' && bad ".env file is tracked" || ok "no .env tracked"

# Metadata must be complete and agree on the version.
for f in .zenodo.json CITATION.cff; do
  [[ -f "$f" ]] || { bad "$f missing"; continue; }
  grep -q 'TODO' "$f" && bad "$f still has TODO" || ok "$f has no TODO"
done
python3 -c 'import json; json.load(open(".zenodo.json"))' 2>/dev/null && ok ".zenodo.json is valid JSON" || bad ".zenodo.json invalid"
v="${TAG#v}"
grep -q "\"version\": \"$v\"" .zenodo.json && ok ".zenodo.json version $v" || bad ".zenodo.json version is not $v"
grep -q "^version: \"\?$v\"\?" CITATION.cff && ok "CITATION.cff version $v" || bad "CITATION.cff version is not $v"
[[ -f LICENSE || -f LICENSE.md ]] && ok "LICENSE present" || bad "LICENSE missing"
grep -q "## \[$v\]" CHANGELOG.md 2>/dev/null && ok "CHANGELOG has $v" || bad "CHANGELOG.md has no [$v] section"

exit $fail
