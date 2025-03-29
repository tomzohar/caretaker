import { SidebarSection } from '@caretaker/caretaker-types';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export function getSidebarConfig(
  openInviteDialog: () => void,
  navigateToPatients: () => void
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
          action: navigateToPatients,
        },
      ],
    },
  ];
}
