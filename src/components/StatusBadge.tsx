import { IconAlertTriangle, IconBug, IconCheck, IconHourglassEmpty, IconLayersIntersect2, IconLoader3, IconPlayerPauseFilled, IconPlayerPlayFilled, IconRocket, IconTransform } from "@tabler/icons-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'queued':
        return { cls: 'status-queued', icon: IconHourglassEmpty };
      case 'starting':
        return { cls: 'status-starting', icon: IconRocket };
      case 'downloading':
        return { cls: 'status-downloading', icon: IconLoader3 };
      case 'merging':
        return { cls: 'status-merging', icon: IconLayersIntersect2 };
      case 'completed':
        return { cls: 'status-completed', icon: IconCheck };
      case 'converting':
        return { cls: 'status-converting', icon: IconTransform };
      case 'error':
        return { cls: 'status-error', icon: IconBug };
      case 'cancelled':
        return { cls: 'status-cancelled', icon: IconPlayerPlayFilled };
      case 'cancelling':
        return { cls: 'status-cancelling', icon: IconPlayerPauseFilled };
      default:
        return { cls: 'status-default', icon: IconAlertTriangle };
    }
  };

  const style = getStatusStyle(status);
  const statusLower = status.toLowerCase();
  const isAnimating = ['downloading', 'queued'].includes(statusLower);

  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-1 text-xs font-medium sm:gap-1 sm:px-3 sm:py-1.5 ${style.cls} ${style.cls} ${style.cls}`}
    >
      {isAnimating ? <Icon size={14} className={`animate-spin sm:size-4`} /> : <Icon size={14} className='sm:size-4' />}
      {status}
    </span>
  );
}
