// eslint-disable-next-line unicorn/filename-case
import { Route, Router, Switch } from 'wouter'
import { GamePlayPage } from '@/pages/game-play-page'
import { GameSetupPage } from '@/pages/game-setup-page'

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={GameSetupPage} />
        <Route path="/game/:logoSet/:gridSize" component={GamePlayPage} />
        <Route>
          {/* 404 - redirect to home */}
          <GameSetupPage />
        </Route>
      </Switch>
    </Router>
  )
}
