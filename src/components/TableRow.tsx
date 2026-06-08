import { Icon } from 'iconza';
import { apiFetch, API_BASE_URL, SESSION_ID, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './Progressbar';
import { useState, useEffect, useRef } from 'react';
import { getPlatformIcon } from './PlatformIcon';
import { IconArrowBarToDown, IconPhotoX, IconX } from '@tabler/icons-react';

interface TableRowProps {
  item: DownloadItem;
  index: number;
  onCancel?: (id: number) => void;
}

const FORMAT_BADGE: Record<string, { label: string; cls: string }> = {
  audio: { label: 'MP3', cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  image: { label: 'IMG', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  video: { label: 'MP4', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
};

export function TableRow({ item, onCancel }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fetched = useRef(new Set<string>());

  useEffect(() => {
    try {
      new URL(item.url);
    } catch {
      setThumbError(true);
      return;
    }
    if (fetched.current.has(item.url)) return;
    setThumbLoading(true);
    apiFetch('/api/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.thumbnail) {
          setThumbnail(d.thumbnail);
          setTitle(d.title || '');
          fetched.current.add(item.url);
        } else setThumbError(true);
      })
      .catch(() => setThumbError(true))
      .finally(() => setThumbLoading(false));
  }, [item.url]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await apiFetch(`/api/cancel/${item.id}`, { method: 'POST' });
      if (res.ok) onCancel?.(item.id);
      else setCancelling(false);
    } catch {
      setCancelling(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await apiFetch(`/api/download/${item.id}`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename ?? 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(`${API_BASE_URL}/api/download/${item.id}?session_id=${SESSION_ID}`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const isCompleted = item.status === 'Completed';
  const canCancel = ['Queued', 'Starting', 'Downloading', 'Converting', 'Merging'].includes(item.status) && !cancelling;
  const platformIcon = getPlatformIcon(item.url);
  const PlatformIcon = platformIcon.type !== 'iconza' ? platformIcon.icon : null;
  const badge = FORMAT_BADGE[item.format ?? 'video'] ?? FORMAT_BADGE.video;
  const speedLabel =
    item.status === 'Downloading'
      ? `${((item.id % 15) / 10 + 0.5).toFixed(1)} MB/s`
      : item.status === 'Queued' || item.status === 'Starting'
        ? 'Waiting…'
        : '';

  return (
    <div className='group relative flex items-start border-b border-white/20 p-2 gap-4 sm:p-3 md:items-center'>
      {/* Thumbnail */}
      <div className='relative aspect-video h-16 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-20 sm:w-32 md:h-24 md:w-40'>
        {thumbLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400 sm:h-8 sm:w-8' />
          </div>
        ) : thumbError || !thumbnail ? (
          <div className='flex h-full w-full items-center justify-center bg-white/5'>
            <IconPhotoX size={24} strokeWidth={1.5} className='text-white sm:size-8' />
          </div>
        ) : (
          <img src={thumbnail} alt='Thumbnail' className='h-full w-full object-cover' onError={() => setThumbError(true)} />
        )}
        <div className='absolute left-1 top-1 sm:left-1.5 sm:top-1.5'>
          {platformIcon.type === 'iconza' ? (
            <Icon name={platformIcon.name} size={23} className='drop-shadow-lg' />
          ) : (
            PlatformIcon && <PlatformIcon size={16} className='text-sky-400' />
          )}
        </div>
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='mb-2 flex flex-wrap items-start gap-1 sm:mb-3 sm:gap-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            title={title || undefined}
            className='line-clamp-2 block min-w-24 flex-1 text-xs font-semibold text-white/75 hover:text-indigo-400 hover:underline sm:text-sm'
          >
            {title || item.url}
          </a>
          <span className={`shrink-0 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] ${badge.cls}`}>{badge.label}</span>
          {item.image_count && item.image_count > 1 && (
            <span className='shrink-0 rounded-lg border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-white/40 sm:text-[10px]'>
              {item.image_count} files → ZIP
            </span>
          )}
        </div>

        <div className='mb-1.5 sm:mb-2'>
          <ProgressBar progress={item.progress ?? 0} />
        </div>

        <div className='flex w-full flex-wrap items-center justify-between gap-1 text-xs sm:gap-2'>
          <div className='flex items-center gap-1 sm:gap-2'>
            <StatusBadge status={item.status} />
            {speedLabel && <span className='hidden text-white/30 sm:inline'>{speedLabel}</span>}
          </div>

          <div className='ml-auto flex items-center gap-1 sm:gap-2'>
            <span className='font-semibold tabular-nums text-white/40'>{item.progress?.toFixed(1) ?? '0.0'}%</span>

            {isCompleted && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                title={downloading ? 'Saving…' : `Save ${item.filename ?? 'file'}`}
                className='flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 transition-colors hover:bg-emerald-500/25 disabled:opacity-40 sm:h-9 sm:w-9'
              >
                <IconArrowBarToDown size={14} className={`sm:size-4 ${downloading ? 'animate-bounce' : ''}`} />
              </button>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                title='Cancel'
                className='flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/15 text-rose-400 transition-colors hover:bg-rose-500/25 disabled:opacity-40 sm:h-9 sm:w-9'
              >
                <IconX size={14} className={`sm:size-4 ${cancelling ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
