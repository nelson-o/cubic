# Cubic

Cubic is a GitHub Pages learning site for exploring a Rubik-style cube through
step-by-step resolving states. The first version presents a 3D mock cube, orbit
controls, highlighted target pieces, and a short guided tutorial.

## Stack

- Bun
- Vite
- React + TypeScript
- Three.js with React Three Fiber and Drei

## Local Development

Install dependencies:

```bash
bun install
```

Run the local dev server:

```bash
bun run dev
```

Run verification:

```bash
bun test
bun run lint
bun run build
```

## GitHub Pages

The Vite base path is configured for `https://nelson-o.github.io/cubic/`.

After authenticating the GitHub CLI, create and push the public repository:

```bash
gh auth login -h github.com
git init
git add .
git commit -m "feat: create cubic learning site"
git branch -M main
gh repo create nelson-o/cubic --public --source=. --remote=origin --push
```

The workflow in `.github/workflows/pages.yml` builds with Bun, runs tests, and
deploys `dist` through GitHub Pages.
