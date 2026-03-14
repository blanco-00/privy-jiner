# Privy-Jiner Troubleshooting Guide

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [AI Integration Issues](#ai-integration-issues)
4. [Network & Connection Issues](#network--connection-issues)
5. [Dashboard Issues](#dashboard-issues)
6. [Plugin Issues](#plugin-issues)
7. [Data & Privacy Issues](#data--privacy-issues)
8. [Performance Issues](#performance-issues)
9. [Crash & Recovery](#crash--recovery)

---

## Installation Issues

### Node.js Version Mismatch

**Symptoms**: Installation fails or unexpected errors during build

**Solution**:
```bash
# Check your Node.js version
node --version

# Ensure Node.js 20.0.0 or higher is installed
# Use nvm to install correct version
nvm install 20
nvm use 20
```

### npm Install Fails

**Symptoms**: `npm install` hangs or fails with errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with verbose output
npm install --verbose
```

### TypeScript Build Errors

**Symptoms**: `npm run build` fails with TypeScript errors

**Solution**:
```bash
# Check TypeScript version
npx tsc --version

# Clean and rebuild
npm run clean
npm run build
```

---

## Database Issues

### Database Locked Error

**Symptoms**: `Error: SQLITE_BUSY: database is locked`

**Causes**:
- Another process is accessing the database
- Previous session crashed without proper cleanup

**Solution**:
```bash
# Find and kill any running processes
lsof ~/.privy-jiner/data/privy-jiner.db

# Or delete the WAL and SHM files
rm ~/.privy-jiner/data/*.wal
rm ~/.privy-jiner/data/*.shm
```

### Database Migration Failed

**Symptoms**: Application won't start after update

**Solution**:
```bash
# Backup current database
cp ~/.privy-jiner/data/privy-jiner.db ~/.privy-jiner/data/backup.db

# Check migration logs
cat ~/.privy-jiner/logs/migration.log

# Restore from backup if needed
cp ~/.privy-jiner/data/backup.db ~/.privy-jiner/data/privy-jiner.db
```

### Database Corruption

**Symptoms**: Query errors, missing data, unexpected crashes

**Solution**:
```bash
# Check database integrity
sqlite3 ~/.privy-jiner/data/privy-jiner.db "PRAGMA integrity_check;"

# Restore from latest backup
cp ~/.privy-jiner/backups/$(ls -t ~/.privy-jiner/backups/ | head -1) ~/.privy-jiner/data/privy-jiner.db
```

---

## AI Integration Issues

### Invalid API Key

**Symptoms**: `401 Unauthorized` or `Authentication failed` errors

**Solution**:
1. Check API key in configuration
2. Ensure API key has sufficient credits
3. For OpenAI: Verify key format (sk-...)
4. For Claude: Verify key format (sk-ant-...)

### Rate Limit Exceeded

**Symptoms**: `429 Too Many Requests` errors

**Solution**:
- Wait for rate limit to reset
- Add delay between requests
- Upgrade to higher API tier
- Configure token limits in settings

### Model Not Available

**Symptoms**: Selected AI model not found or unsupported

**Solution**:
```bash
# List available models
privy-jiner ai models list

# Add a new model
privy-jiner ai models add --provider openai --model gpt-4
```

### Token Limit Reached

**Symptoms**: Requests blocked, "token limit exceeded" message

**Solution**:
```bash
# Check current token usage
privy-jiner ai tokens usage

# Increase limit (requires configuration change)
# Edit config/ai.json
```

### No Response from AI

**Symptoms**: Request hangs or times out

**Solution**:
1. Check internet connection
2. Verify API endpoint accessibility
3. Check firewall/proxy settings
4. Review logs: `~/.privy-jiner/logs/ai.log`

---

## Network & Connection Issues

### WebSocket Connection Failed

**Symptoms**: Dashboard not connecting, real-time updates not working

**Solution**:
```bash
# Check WebSocket server status
lsof -i :8080

# Verify configuration
cat ~/.privy-jiner/config/websocket.json

# Restart the service
privy-jiner restart
```

### Port Already in Use

**Symptoms**: `Error: listen EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using the port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port in configuration
```

### CORS Errors

**Symptoms**: Cross-origin requests blocked in browser

**Solution**:
Update `cors` configuration in `config/server.json`:
```json
{
  "cors": {
    "enabled": true,
    "origins": ["http://localhost:3000"]
  }
}
```

---

## Dashboard Issues

### Dashboard Not Loading

**Symptoms**: Blank page or 404 error

**Solution**:
```bash
# Check if web is built
ls -la packages/web/dist/

# Rebuild web
npm run build:web

# Check browser console for errors
```

### Session Expired

**Symptoms**: Redirected to login frequently

**Solution**:
1. Clear browser cookies
2. Check session timeout configuration
3. Increase session duration in settings

### Static Files Not Loading

**Symptoms**: CSS/JS not loading, broken layout

**Solution**:
```bash
# Check static files exist
ls packages/web/dist/

# Rebuild with fresh cache
npm run clean
npm run build
```

---

## Plugin Issues

### Plugin Not Loading

**Symptoms**: Plugin not appearing in plugin list

**Solution**:
1. Check plugin manifest file (`*.plugin.json`)
2. Verify plugin directory structure
3. Check plugin logs: `~/.privy-jiner/logs/plugins/`

### Plugin Version Mismatch

**Symptoms**: "Incompatible plugin version" error

**Solution**:
- Update plugin to compatible version
- Update Privy-Jiner to required version

### Plugin Crashed

**Symptoms**: Plugin causes application crash

**Solution**:
```bash
# Enable plugin isolation
# Edit config/plugins.json
{
  "isolation": {
    "enabled": true,
    "memoryLimit": 256
  }
}

# Restart and check logs
```

---

## Data & Privacy Issues

### Backup Failed

**Symptoms**: Automatic backup not working

**Solution**:
```bash
# Manual backup
privy-jiner backup create

# Check backup directory permissions
ls -la ~/.privy-jiner/backups/

# Check cron job status
crontab -l
```

### Export Failed

**Symptoms**: Data export times out or incomplete

**Solution**:
- Export in smaller batches
- Check disk space
- Verify write permissions

### Encryption Key Lost

**Symptoms**: Cannot decrypt data after reinstall

**Solution**:
**IMPORTANT**: Without the encryption key, data cannot be recovered!
- Restore from encrypted backup
- Reinitialize with new key (data loss)

---

## Performance Issues

### High Memory Usage

**Symptoms**: Application uses excessive RAM

**Solution**:
1. Enable memory limits in configuration
2. Reduce cache size
3. Limit concurrent operations

### Slow Database Queries

**Symptoms**: Application feels sluggish

**Solution**:
```bash
# Analyze database
sqlite3 ~/.privy-jiner/data/privy-jiner.db "ANALYZE;"

# Check database size
du -h ~/.privy-jiner/data/privy-jiner.db

# Archive old data
privy-jiner cleanup archive
```

### CPU Usage High

**Symptoms**: System fans loud, slow performance

**Solution**:
1. Check for stuck tasks: `privy-jiner task list`
2. Restart service: `privy-jiner restart`
3. Review logs for loops or errors

---

## Crash & Recovery

### Application Won't Start

**Symptoms**: Immediate crash on launch

**Solution**:
```bash
# Check for port conflicts
lsof -i :8080

# Verify configuration files
privy-jiner config validate

# Check recent logs
tail -100 ~/.privy-jiner/logs/error.log
```

### Data Recovery

**Symptoms**: Data loss or corruption

**Recovery Steps**:
1. Stop the service
2. Identify last good backup
3. Restore from backup
4. Verify data integrity

### Complete Reinstall

**Steps**:
```bash
# 1. Backup data directory
cp -r ~/.privy-jiner ~/privy-jiner-backup

# 2. Uninstall
npm uninstall -g privy-jiner

# 3. Reinstall
npm install -g privy-jiner

# 4. Restore config (selectively)
cp ~/privy-jiner-backup/config/* ~/.privy-jiner/config/
```

---

## Getting Help

If your issue is not listed here:

1. **Check Logs**: `~/.privy-jiner/logs/`
2. **Enable Debug Mode**: Set `LOG_LEVEL=debug` in config
3. **Community Support**:
   - GitHub Issues: https://github.com/blanco-00/privy-jiner/issues
   - Gitee Issues: https://gitee.com/232911373/privy-jiner/issues

### When Reporting Issues

Include:
- Operating system and version
- Node.js version
- Privy-Jiner version
- Steps to reproduce
- Relevant log files
- Configuration files (sanitized)
