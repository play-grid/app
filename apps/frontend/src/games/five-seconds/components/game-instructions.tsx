import { Trans } from 'react-i18next';

import { ListGroup, ListItem } from '@/components/ui/list';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

export function GameInstructions() {
  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <span className="text-3xl">🎮</span>
          <Trans i18nKey="fiveSecondsGame.howToPlay" />
        </DialogTitle>
        <DialogDescription>
          <Trans i18nKey="fiveSecondsGame.instructions.description" />
        </DialogDescription>
      </DialogHeader>
      <ListGroup className="rounded-none">
        <ListItem className="rounded-none">
          <Trans i18nKey="fiveSecondsGame.instructions.rule1" />
        </ListItem>
        <ListItem className="rounded-none">
          <Trans i18nKey="fiveSecondsGame.instructions.rule2" />
        </ListItem>
        <ListItem className="rounded-none">
          <Trans i18nKey="fiveSecondsGame.instructions.rule3" />
        </ListItem>
        {/* <ListItem className="rounded-none">
          <Trans i18nKey="fiveSecondsGame.instructions.rule4" />
        </ListItem> */}
        <ListItem className="rounded-none">
          <Trans i18nKey="fiveSecondsGame.instructions.rule5" />
        </ListItem>
      </ListGroup>
    </>
  );
}
