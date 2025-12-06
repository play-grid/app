import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  SessionsCard,
  UpdateAvatarCard,
  UpdateUsernameCard,
} from '@daveyplate/better-auth-ui';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-6 mx-auto max-w-xl">
      <UpdateAvatarCard />
      <UpdateUsernameCard />
      <ChangeEmailCard />
      <ChangePasswordCard />
      <ProvidersCard />
      <SessionsCard />
      <DeleteAccountCard />
    </div>
  );
}
