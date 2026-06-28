# Cubic

Cubic is a fixed-viewport GitHub Pages learning site for replaying a complete
beginner layer-by-layer Rubik-style cube method. The cube state and every face
turn are modeled directly, so lesson animations finish at verified solving
checkpoints rather than visual mock states.

## Tutorial

The replay library covers white cross, white corners, middle edges, yellow
cross, yellow face orientation, yellow corner positioning, and final edge
positioning. Use Play/Pause and Restart to inspect each algorithm, change replay
speed when needed, and drag the cube while playback is paused. The Cases button
opens the complete three-layer lesson library without leaving the WebGL stage.

The document itself never scrolls. Desktop controls float beside the cube and
phone controls stay in a compact bottom overlay; only the optional case library
has its own contained scrolling region.

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
