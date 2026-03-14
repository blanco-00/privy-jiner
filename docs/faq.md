# Frequently Asked Questions (FAQ)

## Table of Contents

1. [General Questions](#general-questions)
2. [Installation & Setup](#installation--setup)
3. [Features & Usage](#features--usage)
4. [Data & Privacy](#data--privacy)
5. [AI Integration](#ai-integration)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## General Questions

### What is Privy-Jiner?

Privy-Jiner (瑾儿私人管家) is an open-source personal AI assistant system designed for individual use. It provides features including finance management, health tracking, fashion recommendations, knowledge push, and news aggregation.

### What platforms does it support?

- **Standalone Mode**: Windows, macOS, Linux
- **Plugin Mode**: OpenClaw-based AI assistants

### What programming languages/technologies are used?

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Database**: SQLite (with optional MySQL/PostgreSQL support)
- **Frontend**: React-based dashboard

---

## Installation & Setup

### What are the system requirements?

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- 500MB disk space (minimum)
- 2GB RAM recommended

### How do I install Privy-Jiner?

```bash
# Clone the repository
git clone https://github.com/blanco-00/privy-jiner.git
cd privy-jiner

# Install dependencies
npm install

# Build the project
npm run build

# Run in standalone mode
npm run dev
```

### Can I install via npm?

Yes! The package can be installed globally:
```bash
npm install -g @privy-jiner/core
```

### How do I configure the application?

Configuration files are located in `~/.privy-jiner/config/`:
- `config.json` - Main configuration
- `ai.json` - AI model settings
- `database.json` - Database configuration

---

## Features & Usage

### What modules are available?

| Module | Features |
|--------|----------|
| Finance | Income/expense tracking, budgets, investments, recurring bills |
| Health | Water intake, exercise tracking, health goals, reminders |
| Fashion | Wardrobe management, outfit tracking, recommendations |
| Knowledge | Daily knowledge push, categorization |
| News | News aggregation, personalization, summaries |

### How do I use the finance module?

```bash
# Add income
privy-jiner finance add income --amount 5000 --category salary

# Add expense
privy-jiner finance add expense --amount 150 --category food

# View report
privy-jiner finance report --period month
```

### How do I track health data?

```bash
# Log water intake (ml)
privy-jiner health water --amount 2000

# Log exercise
privy-jiner health exercise --activity running --duration 30

# Check goals
privy-jiner health goals
```

### Is there a web dashboard?

Yes! Access the dashboard at `http://localhost:8080` when running in standalone mode.

---

## Data & Privacy

### Where is my data stored?

All data is stored locally in `~/.privy-jiner/data/`:
- SQLite database: `privy-jiner.db`
- Backups: `~/.privy-jiner/backups/`
- Logs: `~/.privy-jiner/logs/`

### Is my data sent to the cloud?

**No.** Privy-Jiner is designed with complete local-first privacy:
- No cloud sync
- No data upload
- All processing happens locally
- You control your data

### How do I encrypt my data?

Enable encryption in `config.json`:
```json
{
  "privacy": {
    "encryption": {
      "enabled": true,
      "algorithm": "AES-256-GCM"
    }
  }
}
```

**Important**: Store your encryption key securely. Lost keys cannot be recovered!

### How do I backup my data?

```bash
# Manual backup
privy-jiner backup create

# Automated backups run daily
# Backups stored in ~/.privy-jiner/backups/
```

### How do I export my data?

```bash
# Export to JSON
privy-jiner export --format json

# Export to CSV
privy-jiner export --format csv

# Export specific module
privy-jiner export --module finance --format json
```

---

## AI Integration

### Which AI models are supported?

- OpenAI: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Anthropic: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- Custom: Any OpenAI-compatible API

### How do I configure an AI model?

```bash
# Add a model
privy-jiner ai models add --provider openai --model gpt-4

# Set default model
privy-jiner ai models default --model gpt-4

# Configure API key
privy-jiner ai config --api-key YOUR_API_KEY
```

### Can I use local AI models?

Yes, by using Ollama or similar local LLM servers:
```bash
privy-jiner ai models add --provider local --model llama2 --endpoint http://localhost:11434
```

### How much does AI integration cost?

AI API costs depend on:
- Your API provider subscription
- Model used
- Number of requests
- Token consumption

Set token limits in configuration to control costs.

### Is my API key secure?

Yes:
- Keys are encrypted at rest
- Keys are never logged
- Keys can be rotated easily

---

## Deployment

### What deployment modes are available?

1. **Standalone Mode**: Full application with web dashboard
2. **Plugin Mode**: Runs as OpenClaw plugin (lightweight)

### How do I run as a service?

Using systemd (Linux):
```bash
sudo cp privy-jiner.service /etc/systemd/system/
sudo systemctl enable privy-jiner
sudo systemctl start privy-jiner
```

### How do I update Privy-Jiner?

```bash
# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart service
sudo systemctl restart privy-jiner
```

### Can I run in Docker?

```bash
# Build image
docker build -t privy-jiner .

# Run container
docker run -d -p 8080:8080 -v ~/.privy-jiner:/root/.privy-jiner privy-jiner
```

---

## Troubleshooting

### Application won't start

1. Check if port 8080 is available
2. Verify Node.js version (20+)
3. Check logs: `~/.privy-jiner/logs/`

### Database locked error

```bash
# Remove lock files
rm ~/.privy-jiner/data/*.wal
rm ~/.privy-jiner/data/*.shm
```

### AI requests failing

1. Verify API key is correct
2. Check API credits/limits
3. Ensure internet connectivity

### Need more help?

- GitHub Issues: https://github.com/blanco-00/privy-jiner/issues
- Gitee Issues: https://gitee.com/232911373/privy-jiner/issues

---

## Contributing

### How can I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

### Is there a code of conduct?

Yes, see [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).

---

## License

Privy-Jiner is open source under the [MIT License](../LICENSE).

---

## Contact

- GitHub: https://github.com/blanco-00/privy-jiner
- Gitee: https://gitee.com/232911373/privy-jiner
