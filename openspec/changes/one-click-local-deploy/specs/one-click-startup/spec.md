## ADDED Requirements

### Requirement: One-click startup script works on clean environment
The system SHALL provide a `start-jiner.sh` script that works on a fresh environment.

#### Scenario: Script installs dependencies
- **WHEN** user runs `./start-jiner.sh` on clean environment
- **THEN** script runs `npm install` automatically
- **AND** logs progress to console

#### Scenario: Script builds project
- **WHEN** dependencies are installed
- **THEN** script runs `npm run build` automatically
- **AND** logs build progress

#### Script outputs clear progress logs
- **GIVEN** script is running
- **WHEN** each step starts
- **THEN** log "[STEP 1/4] Installing dependencies..." is printed
- **AND** log "[STEP 2/4] Building project..." is printed

### Requirement: Script validates environment before starting
The script SHALL check Node.js version and port availability before starting.

#### Scenario: Node.js version check
- **WHEN** user runs script with Node.js < 18
- **THEN** script exits with error "Node.js 18+ required"
- **AND** logs current version

#### Scenario: Port availability check
- **WHEN** port 18788 is already in use
- **THEN** script logs warning and suggests alternative port
- **OR** attempts to use next available port

### Requirement: Script provides clear completion message
The script SHALL display clear instructions after successful startup.

#### Scenario: Successful startup
- **WHEN** Jiner service starts successfully
- **THEN** script displays "Jiner is running at http://localhost:18788"
- **AND** displays "Configure OpenClaw plugin: dist/openclaw-plugin.js"
