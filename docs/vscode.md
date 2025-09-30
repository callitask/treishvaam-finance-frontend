## VS Code setup and recommended extensions

This file lists recommended extensions and example workspace settings to make development consistent across the team.

Recommended extensions
- ESLint — linting for JavaScript/TypeScript
- Prettier — code formatting
- EditorConfig for VS Code — keep consistent editor settings
- ES7+ React/Redux/React-Native snippets — handy React snippets
- Simple React Snippets or Reactjs code snippets — optional
- vscode-styled-components (if using styled-components)
- Tailwind CSS IntelliSense — Tailwind utility autocompletion
- Debugger for Chrome / Microsoft Edge Tools — frontend debugging

Why these?
- ESLint + Prettier keep code quality and style consistent.
- EditorConfig ensures consistent indentation and newlines across editors.
- React snippets speed up development.
- Tailwind CSS IntelliSense helps while editing Tailwind classes.

Workspace settings (.vscode/settings.json)

Put the included `.vscode/settings.json` in the project root to enable consistent formatting and linting behavior. Key bits included:

- Format on save (Prettier)
- Use ESLint as the default formatter for JS/TS
- Files to exclude from search/build when working with the `build/` folder

Debugging with `.vscode/launch.json`

An example `launch.json` is provided that configures the built-in VS Code debugger to attach to a browser when running `npm start` (Create React App). This uses the "pwa-chrome" adapter (works with Chromium-based browsers). If you prefer Edge, change the `name` and `runtimeExecutable` accordingly.

How to use

1. Install the recommended extensions.
2. Copy the `.vscode` folder into the project root (committed to repo is fine for team settings).
3. Start the dev server: `npm start`.
4. Open the Debug view and run "Launch Chrome against localhost".

Notes
- If team policy forbids committing `.vscode` folder, keep these files locally and share via the docs.
- Adjust `url` and `port` in `launch.json` if your dev server runs on a different port.
