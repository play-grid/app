import { Route, Switch } from 'wouter'
import { GamePlayPage } from '@/pages/game-play-page'
import { GameSetupPage } from '@/pages/game-setup-page'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={GameSetupPage} />
      <Route path="/game/:logoSet/:gridSize/:playerA/:playerB" component={GamePlayPage} />
      <Route>
        {/* 404 - redirect to home */}
        <GameSetupPage />
      </Route>
    </Switch>
  )
}
