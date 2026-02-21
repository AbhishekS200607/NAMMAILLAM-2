# Copilot Instructions for this Project

Purpose
- Provide concise, project-specific guidance for the assistant (GitHub Copilot) when editing this repo.

General behavior
- Be concise and direct. Ask clarifying questions only when necessary.
- Prefer minimal, focused edits; avoid changing unrelated files.
- Use `apply_patch` for file edits and create files under the workspace root when needed.
- Run quick, relevant checks (lint/tests) if they exist and are easy to run.

Editing & Coding
- Fix root causes, not symptoms. Keep changes small and reversible.
- Follow existing code style and indentation.
- Avoid adding new dependencies unless the user approves.

HTML/CSS specifics
- Prefer adding footer/scoped CSS in a single small block near the affected markup (or in an existing stylesheet if the user prefers).
- Use footer-scoped selectors (e.g., `.elementor-location-footer`) to avoid global regressions.

Tooling & Workflow
- When making multi-step changes, create and maintain a short todo list using the workspace `manage_todo_list` tool.
- Before any tool call, show a one-line preamble describing what you're about to do.
- After edits, summarize changes and ask whether to run further verification or move styles to separate files.

Communications
- When referencing project files in messages, use the repository-relative link format (e.g., `index.html`).
- If asked to make UI size/spacing tweaks, provide 2–3 sensible presets and implement the selected preset.

Safety & Constraints
- Do not include or leak model identifiers unless explicitly asked by the user.
- Avoid adding copyrighted content verbatim unless the user provides it or it's licensed for reuse.

If you'd like a different filename, additional rules, or a shorter/longer version, tell me which and I'll update the file.