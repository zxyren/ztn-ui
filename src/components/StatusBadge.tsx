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

  const SHORT_STATUS: Record<string, string> = {
    Completed: 'Done',
    Downloading: 'DL',
    Converting: 'Conv',
    Merging: 'Merge',
    Queued: 'Wait',
    Starting: 'Start',
    Cancelled: 'Stop',
    Cancelling: 'Stopping',
    Error: 'Fail',
  };

  const label = SHORT_STATUS[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs ${style.cls}`}
    >
      {isAnimating ? <Icon size={12} className={`animate-spin sm:size-3.5`} /> : <Icon size={12} className='sm:size-3.5' />}
      {label}
    </span>
  );
}
