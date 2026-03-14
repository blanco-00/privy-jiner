# data-privacy Specification

## Purpose
TBD - created by archiving change privy-jiner-open-source. Update Purpose after archive.
## Requirements
### Requirement: Local data storage
The system SHALL store all user data locally without cloud synchronization.

#### Scenario: Initialize data directory
- **WHEN** system starts first time
- **THEN** system creates data directory in user home
- **AND** system sets directory permissions to user-only (700)
- **AND** system initializes SQLite database in data directory

#### Scenario: Verify data locality
- **WHEN** system saves data
- **THEN** system writes to local file system only
- **AND** system does not upload to external services
- **AND** system logs all data writes

#### Scenario: Restrict data access
- **WHEN** external process attempts to access data directory
- **THEN** system denies access if not authorized
- **AND** system logs access attempt
- **AND** system notifies user of unauthorized access

---

### Requirement: Configuration security
The system SHALL securely store sensitive configuration values (API keys, credentials).

#### Scenario: Store API keys
- **WHEN** user configures API keys
- **THEN** system stores keys in configuration file
- **AND** system encrypts keys at rest (optional, based on user preference)
- **AND** system restricts file permissions to user-only

#### Scenario: Load API keys
- **WHEN** system loads API keys
- **THEN** system reads from configuration file
- **AND** system decrypts if encrypted
- **AND** system never logs API keys

#### Scenario: Remove API keys
- **WHEN** user removes an API key
- **THEN** system removes key from configuration
- **AND** system clears any in-memory cache of key
- **AND** system confirms removal to user

---

### Requirement: Data encryption (optional)
The system SHALL support optional encryption for sensitive data.

#### Scenario: Enable database encryption
- **WHEN** user enables database encryption
- **THEN** system generates encryption key
- **AND** system stores key in secure keystore (e.g., OS keychain)
- **AND** system encrypts database file

#### Scenario: Decrypt database on startup
- **WHEN** system starts with encrypted database
- **THEN** system retrieves encryption key from keystore
- **AND** system decrypts database
- **AND** system handles decryption failure gracefully

#### Scenario: Change encryption key
- **WHEN** user changes encryption key
- **THEN** system re-encrypts database with new key
- **AND** system updates key in keystore
- **AND** system deletes old key

---

### Requirement: Backup and restore
The system SHALL provide backup and restore functionality for user data.

#### Scenario: Create daily backup
- **WHEN** system performs daily backup (triggered externally)
- **THEN** system copies database to backup directory
- **AND** system copies configuration files to backup directory
- **AND** system includes timestamp in backup filename
- **AND** system encrypts backup if encryption enabled

#### Scenario: Manual backup
- **WHEN** user requests manual backup
- **THEN** system creates backup of all data
- **AND** system provides download link
- **AND** system confirms backup completion

#### Scenario: Restore from backup
- **WHEN** user restores from backup
- **THEN** system validates backup file integrity
- **THEN** system restores database from backup
- **AND** system restores configuration from backup
- **AND** system restarts system

#### Scenario: Manage backup retention
- **WHEN** system performs backup cleanup (triggered externally)
- **THEN** system retains last 7 days of backups
- **AND** system archives backups older than 7 days
- **AND** system deletes backups older than 30 days

---

### Requirement: Data export
The system SHALL allow users to export their data in common formats.

#### Scenario: Export to JSON
- **WHEN** user exports data to JSON
- **THEN** system dumps database to JSON format
- **AND** system includes all tables and relationships
- **AND** system provides download file

#### Scenario: Export to CSV
- **WHEN** user exports data to CSV
- **THEN** system exports selected table to CSV format
- **AND** system includes headers matching column names
- **AND** system provides download file

#### Scenario: Export configuration
- **WHEN** user exports configuration
- **THEN** system exports configuration file
- **AND** system masks sensitive values (API keys)
- **AND** system provides download file

---

### Requirement: Data cleanup
The system SHALL provide cleanup functionality for old or unused data.

#### Scenario: Archive old data
- **WHEN** system archives old data (triggered externally)
- **THEN** system moves data older than threshold to archive
- **AND** system compresses archived data
- **AND** system maintains index for archived data

#### Scenario: Delete old logs
- **WHEN** system deletes old logs (triggered externally)
- **THEN** system deletes log files older than 7 days
- **AND** system keeps recent logs accessible
- **AND** system frees disk space

#### Scenario: Clear cache
- **WHEN** user clears cache
- **THEN** system deletes all cached data
- **AND** system deletes temporary files
- **AND** system confirms cache cleared

---

### Requirement: Task expiration and cleanup
The system SHALL define and enforce expiration rules for tasks.

#### Scenario: Archive completed tasks
- **WHEN** task is completed for more than 7 days
- **THEN** system archives task to archive directory
- **AND** system keeps most recent 20 completed tasks in active list
- **AND** system uses archive file naming: tasks-YYYY-MM.md

#### Scenario: Expire pending tasks
- **WHEN** pending task exceeds expiration threshold (N days)
- **THEN** system marks task as expired
- **AND** system updates task status with expiration date
- **AND** system sends expiration notification

#### Scenario: Cleanup stuck tasks
- **WHEN** task is stuck (no progress) for more than 30 minutes
- **THEN** system resets task status to pending
- **AND** system logs cleanup action
- **AND** system notifies user of cleanup

---

### Requirement: Session cleanup
The system SHALL clean up expired sessions.

#### Scenario: Delete expired sessions
- **WHEN** session expires (older than 7 days)
- **THEN** system deletes session data
- **AND** system frees session resources
- **AND** system logs session cleanup

#### Scenario: Force session cleanup
- **WHEN** user triggers manual session cleanup
- **THEN** system deletes all expired sessions
- **AND** system reports deleted session count

---

### Requirement: Backup retention policy
The system SHALL define retention rules for backups.

#### Scenario: Enforce backup retention
- **WHEN** system performs backup cleanup (triggered externally)
- **THEN** system retains backups for last 7 days
- **AND** system archives backups older than 7 days
- **AND** system deletes backups older than 30 days

#### Scenario: Compress old backups
- **WHEN** backup age exceeds 7 days
- **THEN** system compresses backup using gzip
- **AND** system stores compressed backup in archive directory

