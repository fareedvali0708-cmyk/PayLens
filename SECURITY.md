# Security Policy

## Scope & Test Mode Notice
PayLens is currently configured and evaluated exclusively in **Razorpay Test Mode** for demonstration and portfolio assessment. No production payment credentials or live consumer financial transactions should be routed through test deployments.

## Supported Security Reporting
If you discover a security vulnerability or sensitive finding in PayLens, please do not disclose it publicly via GitHub Issues, Discussions, or pull requests.

Instead, please report security concerns directly to the project maintainer:
- **Maintainer Contact**: `fareedvali0708@gmail.com`
- Include a detailed summary of the vulnerability, step-by-step reproduction steps, and potential impact.
- Please provide reasonable time for investigation and remediation before public discussion.

## Guidelines
- **Never submit credentials or secrets**: Do not include actual API keys, service role tokens, passwords, or production webhook secrets in bug reports, pull requests, or issue trackers.
- **Local environment isolation**: All sensitive configurations should remain confined to local, uncommitted `.env` files matching `.env.example`.
- **Responsible disclosure**: Maintainers appreciate constructive, responsible reporting that improves codebase safety and integrity.
