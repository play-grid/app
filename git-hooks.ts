// git-hooks.config.ts
import type { GitHooksConfig } from 'bun-git-hooks'

const config: GitHooksConfig = {
  'pre-commit': 'bun run lint-staged',
  'commit-msg': 'bun commitlint --edit $1',
  'pre-push': 'bun run build',
}

export default config