import type { Invitation } from '../types/Invitation';

interface Props {
  invitation: Invitation;
  applyInvitation: (room: string) => void;
  rejectInvitation: (room: string) => void;
}

export const InvitationCard: React.FC<Props> = ({
  invitation,
  applyInvitation,
  rejectInvitation,
}) => {
  return (
    <div className="w-full flex flex-col gap-2 p-2 elements-color">
      <span> Accept invitation from user: {invitation.room}</span>
      <div className="w-full flex justify-between gap-6">
        <button
          className="w-full cursor-pointer bg-green-900 h-10 rounded-2xl"
          onClick={() => applyInvitation(invitation.room)}
        >
          Yes
        </button>
        <button
          className="w-full cursor-pointer bg-red-900 px-2 rounded-2xl"
          onClick={() => rejectInvitation(invitation.room)}
        >
          No
        </button>
      </div>
    </div>
  );
};
