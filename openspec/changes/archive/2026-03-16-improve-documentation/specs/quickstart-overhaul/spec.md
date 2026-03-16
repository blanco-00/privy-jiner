## ADDED Requirements

### Requirement: Quickstart document provides copy-paste experience
The quickstart document SHALL enable new users to get jiner running by copying and executing commands sequentially without making decisions.

#### Scenario: New user completes quickstart
- **WHEN** user follows quickstart steps in order
- **THEN** jiner service is running and accessible at http://localhost:3001

#### Scenario: OpenClaw plugin is loadable
- **WHEN** user completes quickstart configuration
- **THEN** OpenClaw can load the plugin from dist/openclaw-plugin.js

### Requirement: Quickstart uses consistent port numbers
All quickstart documentation SHALL use the same port numbers: API at 3001, OpenClaw at 18789.

#### Scenario: Port consistency check
- **WHEN** user reads any documentation
- **THEN** port 3001 is consistently used for jiner API
- **AND** port 18789 is consistently used for OpenClaw

### Requirement: Quickstart includes verification steps
The quickstart SHALL include commands or URLs to verify each step completed successfully.

#### Scenario: Service health check
- **WHEN** user starts jiner service
- **THEN** user can verify service is running by checking http://localhost:3001/health or similar endpoint

#### Scenario: Plugin discovery verification
- **WHEN** OpenClaw loads jiner plugin
- **THEN** user can verify plugin is loaded by checking OpenClaw plugin list
