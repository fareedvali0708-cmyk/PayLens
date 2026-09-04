# Contributing to PayLens

We welcome contributions! Please follow these steps when submitting a pull request:

1. **Fork the repository** and clone your fork locally.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b my-feature
   ```
3. **Make your changes**. Keep the existing coding style and run the linter:
   ```bash
   cd client && npm run lint   # client lint
   cd ../server && npm run lint   # (no lint script – run your own checks)
   ```
4. **Run the test suite** to ensure nothing breaks:
   ```bash
   # Server tests (run the .js test files directly)
   node server/test_*.js
   ```
   The client does not have automated tests yet; manual UI testing is sufficient.
5. **Commit your changes** with clear messages.
6. **Push** to your fork and open a pull request against the `master` branch.

### Code Style
- Use **Prettier** / **oxlint** formatting for the client.
- Follow existing naming conventions (camelCase for JS, PascalCase for React components).
- Keep the UI unchanged – only bug fixes, documentation, or non‑breaking improvements are accepted.

### Review Process
- CI will run lint and server tests automatically.
- Reviewers will check for secret leakage and adherence to the project’s architecture.
- Once approved, the PR will be merged.

Thank you for helping improve PayLens! 🙏
