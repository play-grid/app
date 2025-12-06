import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  SessionsCard,
  UpdateAvatarCard,
  UpdateUsernameCard,
} from '@daveyplate/better-auth-ui';
import BackButton from '@/components/back-button';

export default function AccountPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <div>
        <BackButton />
      </div>

      <div className="flex flex-col gap-6 mx-auto max-w-xl">
        <UpdateAvatarCard />
        <UpdateUsernameCard />
        <ChangeEmailCard />
        <ChangePasswordCard />
        <ProvidersCard />
        <SessionsCard />
        <DeleteAccountCard />
      </div>
    </div>
  );
}
