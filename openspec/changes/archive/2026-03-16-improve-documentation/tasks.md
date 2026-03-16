## 1. Create .env.example Template

- [x] 1.1 Create .env.example file in project root with minimal required fields
- [x] 1.2 Add comments explaining each configuration variable
- [x] 1.3 Mark API key fields with security notes (e.g., "# ⚠️ Never commit this to git")

## 2. Update Quickstart Documentation

- [x] 2.1 Rewrite docs/quickstart.md with "5秒→5分钟→深入"三段式 structure
- [x] 2.2 Add step numbers and verification checks after each step
- [x] 2.3 Replace port 3000 with 3001 consistently throughout
- [x] 2.4 Add "✓ Done" indicators for completed steps
- [x] 2.5 Include curl commands or URLs for health verification

## 3. Update Main README

- [x] 3.1 Fix port number to consistent 3001 in README.md
- [x] 3.2 Add reference to .env.example template
- [x] 3.3 Update quick start section to match new quickstart.md

## 4. Add Visual Guides

- [x] 4.1 Create ASCII architecture diagram for docs
- [x] 4.2 Add screenshot placeholders with descriptions in plugin setup section
- [x] 4.3 Include visual "port map" table showing all services and ports

## 5. Cross-Reference Updates

- [x] 5.1 Update docs/manual.md port references to match
- [x] 5.2 Check docs/troubleshooting.md for port consistency
- [x] 5.3 Verify all docs link to correct quickstart.md

## 6. Verification

- [x] 6.1 Test quickstart steps on fresh environment
- [x] 6.2 Verify .env.example can be copied and used as starting point
- [x] 6.3 Confirm all port references are consistent across all docs (now 3001 as default, customizable via JINER_PORT)
