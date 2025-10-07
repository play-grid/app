import type { ComponentProps } from 'react';
import { Icon } from '@iconify/react';

// Centralized icon components using @iconify/react
// This allows easy icon changes across the entire application

type IconProps = Omit<ComponentProps<typeof Icon>, 'icon'>;

export function TrophyIcon(props: IconProps) {
  return <Icon icon="solar:cup-bold-duotone" {...props} />;
}

export function GridIcon(props: IconProps) {
  return <Icon icon="mynaui:grid-one" {...props} />;
}

export function UsersIcon(props: IconProps) {
  return <Icon icon="solar:users-group-rounded-line-duotone" {...props} />;
}

export function ClockIcon(props: IconProps) {
  return <Icon icon="solar:history-line-duotone" {...props} />;
}

export function BuildingsIcon(props: IconProps) {
  return <Icon icon="solar:buildings-2-bold-duotone" {...props} />;
}

export function FlagIcon(props: IconProps) {
  return <Icon icon="solar:flag-2-bold-duotone" {...props} />;
}

export function VideoIcon(props: IconProps) {
  return <Icon icon="solar:video-frame-line-duotone" {...props} />;
}

export function BasketballIcon(props: IconProps) {
  return <Icon icon="solar:basketball-line-duotone" {...props} />;
}

export function PlusIcon(props: IconProps) {
  return <Icon icon="mingcute:add-fill" {...props} />;
}

export function RestartIcon(props: IconProps) {
  return <Icon icon="solar:restart-line-duotone" {...props} />;
}
export function RefreshIcon(props: IconProps) {
  return <Icon icon="solar:refresh-line-duotone" {...props} />;
}
