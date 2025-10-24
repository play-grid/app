import type { IconifyJSON } from '@iconify/react';
import solar from '@iconify-json/solar/icons.json';
import { addCollection, Icon } from '@iconify/react';

addCollection(solar as IconifyJSON);

export type AppIconProps = React.ComponentProps<typeof Icon>;

type IconProps = Omit<AppIconProps, 'icon'>;

export function AppIcon(props: AppIconProps) {
  return <Icon {...props} className={`inline-block align-middle ${props.className ?? ''}`} />;
}

export const TrophyIcon = (props: IconProps) => <AppIcon icon="solar:cup-bold-duotone" {...props} />;
export const GridIcon = (props: IconProps) => <AppIcon icon="mynaui:grid-one" {...props} />;
export const UsersIcon = (props: IconProps) => <AppIcon icon="solar:users-group-rounded-line-duotone" {...props} />;
export const ClockIcon = (props: IconProps) => <AppIcon icon="solar:history-line-duotone" {...props} />;
export const BuildingsIcon = (props: IconProps) => <AppIcon icon="solar:buildings-2-bold-duotone" {...props} />;
export const FlagIcon = (props: IconProps) => <AppIcon icon="solar:flag-2-bold-duotone" {...props} />;
export const VideoIcon = (props: IconProps) => <AppIcon icon="solar:video-frame-line-duotone" {...props} />;
export const BasketballIcon = (props: IconProps) => <AppIcon icon="solar:basketball-line-duotone" {...props} />;
export const PlusIcon = (props: IconProps) => <AppIcon icon="mingcute:add-fill" {...props} />;
export const RestartIcon = (props: IconProps) => <AppIcon icon="solar:restart-line-duotone" {...props} />;
export const RefreshIcon = (props: IconProps) => <AppIcon icon="solar:refresh-line-duotone" {...props} />;
