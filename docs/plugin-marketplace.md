# Plugin Marketplace Guidelines

## Table of Contents

1. [Overview](#overview)
2. [Submission Process](#submission-process)
3. [Review Criteria](#review-criteria)
4. [Plugin Quality Standards](#plugin-quality-standards)
5. [Categorization](#categorization)
6. [Pricing](#pricing)
7. [Support](#support)
8. [Removal Policy](#removal-policy)

---

## Overview

The Privy-Jiner Plugin Marketplace provides a platform for developers to share and distribute plugins with the community. This document outlines the guidelines for submitting and maintaining plugins in the marketplace.

---

## Submission Process

### Prerequisites

- [ ] Valid GitHub or Gitee account
- [ ] Published npm package or direct submission
- [ ] Complete plugin documentation
- [ ] Passing test suite

### Submission Steps

1. **Prepare Your Plugin**
   - Ensure all code is in a public repository
   - Include LICENSE file
   - Write comprehensive README

2. **Create Submission Issue**
   - Navigate to GitHub Issues
   - Use "Plugin Submission" template
   - Fill in all required fields

3. **Submit for Review**
   - Wait for automated checks
   - Respond to reviewer feedback
   - Address any issues raised

4. **Publication**
   - Receive approval notification
   - Plugin listed in marketplace
   - Announced to community (optional)

---

## Review Criteria

### Security

- [ ] No exposed API keys or secrets
- [ ] Safe input validation
- [ ] No malicious code
- [ ] Dependencies are secure

### Functionality

- [ ] Plugin loads without errors
- [ ] All declared features work
- [ ] Error handling in place
- [ ] Cleanup on unload

### Documentation

- [ ] Clear installation instructions
- [ ] Usage examples provided
- [ ] API documentation complete
- [ ] Changelog maintained

### Code Quality

- [ ] TypeScript with type definitions
- [ ] Consistent code style
- [ ] No console.log in production
- [ ] Unit tests included

---

## Plugin Quality Standards

### Required Elements

Every plugin must include:

1. **plugin.json** - Valid manifest with all required fields
2. **README.md** - Installation and usage guide
3. **LICENSE** - Open source license (MIT recommended)
4. **package.json** - npm package configuration

### Recommended Features

- Version compatibility declaration
- Configuration options
- Logging integration
- Event documentation

### Performance

- Load time under 2 seconds
- Memory usage under 100MB
- No blocking operations
- Efficient database queries

---

## Categorization

### Categories

| Category | Description |
|----------|-------------|
| Finance | Budgeting, investments, expense tracking |
| Health | Fitness, nutrition, wellness |
| Fashion | Wardrobe, styling, recommendations |
| Knowledge | Learning, flashcards, facts |
| News | RSS, aggregation, curation |
| Productivity | Task management, automation |
| Utilities | Tools, helpers, integrations |
| Entertainment | Games, fun features |

### Tags

Add relevant tags to improve discoverability:
- `ai` - AI-powered features
- `automation` - Automated workflows
- `api` - External API integrations
- `offline` - Works without internet

---

## Pricing

### Free Plugins

Most plugins should be free:
- Community contribution
- Open source spirit
- No paywalls on features

### Paid Plugins

Premium features allowed:
- Must have free tier
- Clear pricing model
- Secure payment processing
- Refund policy

### Donation

Support authors via:
- GitHub Sponsors
- Open Collective
- Direct PayPal

---

## Support

### Developer Responsibilities

Plugin authors must:
- Respond to issues within 7 days
- Maintain compatibility with latest versions
- Provide clear documentation
- Update dependencies promptly

### User Expectations

Users can expect:
- Working plugin functionality
- Bug fixes within reasonable time
- Clear communication about issues
- Advance notice of breaking changes

---

## Removal Policy

### Voluntary Removal

Authors can request removal:
- Submit issue requesting removal
- Provide 30-day transition period
- Archive repository

### Involuntary Removal

Plugins removed for:
- Security vulnerabilities (30 days to fix)
- Malicious code
- License violations
- Abandoned (no updates for 1 year)
- User complaints (reviewed case-by-case)

### Appeal Process

If your plugin is removed:
1. Receive notification with reason
2. Fix the issues
3. Submit appeal with corrections
4. Wait for re-review (14 days)

---

## Best Practices

### Maintain Your Plugin

- Update for new Privy-Jiner versions
- Respond to user feedback
- Fix bugs promptly
- Keep dependencies current

### Communicate

- Clear changelog
- Version release notes
- Migration guides for breaking changes
- Active issue tracker

### Build Community

- Engage with users
- Accept contributions
- Document known limitations
- Consider feature requests

---

## Contact

- Plugin Support: plugins@privy-jiner.dev
- Security Issues: security@privy-jiner.dev
- General Inquiries: info@privy-jiner.dev
