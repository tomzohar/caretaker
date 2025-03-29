import { appStore, InviteApiService } from '@caretaker/caretaker-data';
import { AlertType, SidebarSection } from '@caretaker/caretaker-types';
import { Invite, InviteFormData } from '@caretaker/invite';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const handleInviteSubmit = async (data: InviteFormData) => {
  try {
    await InviteApiService.inviteToAccount({ emails: data.emails });
    appStore.closeModal();
    appStore.setAlert({
      message: `Invitation${
        data.emails.length > 1 ? 's' : ''
      } sent to ${data.emails.join(', ')}`,
      type: 'success' as AlertType,
    });
  } catch (err) {
    console.error('Failed to send invitations:', err);
    appStore.setAlert({
      message: 'Failed to send invitations. Please try again.',
      type: AlertType.ERROR,
    });
  }
};

const openInviteDialog = () => {
  appStore.openModal({
    title: 'Invite User',
    content: (
      <Invite
        onSubmit={handleInviteSubmit}
        onCancel={() => appStore.closeModal()}
      />
    ),
    disableCloseOnClickOutside: true,
  });
};

export function getSidebarConfig(
  navigateFn: (path: string) => void
): SidebarSection[] {
  return [
    {
      id: 'actions',
      items: [
        {
          id: 'invite',
          text: 'Invite User',
          icon: PersonAddIcon,
          action: openInviteDialog,
        },
      ],
    },
    {
      id: 'main',
      items: [
        {
          id: 'patients',
          text: 'Patients',
          icon: Diversity1Icon,
          action: () => navigateFn('/patients'),
        },
      ],
    },
  ];
}
