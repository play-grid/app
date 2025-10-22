import { Trans } from 'react-i18next';

import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListGroup, ListItem } from '@/components/ui/list';

export function GameInstructions() {
  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <span className="text-3xl">🎮</span>
          <Trans i18nKey="fiveSecondsGame.howToPlay" />
        </DialogTitle>
      </DialogHeader>
      <ListGroup>
        <ListItem>
          <Trans i18nKey="fiveSecondsGame.instructions.rule1" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="fiveSecondsGame.instructions.rule2" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="fiveSecondsGame.instructions.rule3" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="fiveSecondsGame.instructions.rule4" />
        </ListItem>
        <ListItem>
          <Trans i18nKey="fiveSecondsGame.instructions.rule5" />
        </ListItem>
      </ListGroup>
    </>
  );
}
