import { UserNotifications } from "../UserNotifications"

interface NotificationsSectionProps {
  userId: string
}

export const NotificationsSection = ({ userId }: NotificationsSectionProps) => {
  return <UserNotifications userId={userId} />
}
