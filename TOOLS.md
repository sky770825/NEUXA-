# TOOLS.md - Local Notes & Overrides

This file contains my verified, ground-truth understanding of the tools available in this specific environment. It overrides any outdated knowledge from my base training.

**Last Synced:** 2026-02-26

---

## `openclaw` CLI v2026.2.24 - Core Commands

### Spawning a Sub-Agent

The primary command to spawn a sub-agent is `openclaw agent`. The legacy `spawn` command is **DEPRECATED AND REMOVED**.

**Correct Syntax:**
`openclaw agent --model <model_id> --thinking <label> -m "<message>"`

**Key Parameters:**
- `--model <model_id>`: (Optional) Specifies the model to use. For L2 tasks, this should be `'anthropic/claude-opus-4-6'`.
- `--thinking <label>`: (Optional) Sets a descriptive label for the agent's task, visible in logs and status.
- `-m, --message <text>`: (**Required**) The prompt or task description for the agent.

**Example:**
```shell
openclaw agent --model 'anthropic/claude-opus-4-6' --thinking '💬 | L2 | Task Name' -m "Your detailed task description here."
```

---
### Other Core Commands

- **`sessions`**: Used to list and manage conversation sessions.
- **`message`**: Used for all channel-related actions (send, react, poll, etc.).
- **`cron`**: Manages scheduled tasks.
- **`update`**: Manages OpenClaw self-updates.

This knowledge base is now the single source of truth for CLI operations.
