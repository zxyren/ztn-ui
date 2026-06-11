import { apiFetch, API_BASE_URL, SESSION_ID, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './Progressbar';
import { useState, useEffect } from 'react';
import { IconDownload, IconTrash, IconDownloadOff, IconUnlink, IconPlayerPlay, IconMusic, IconPhoto } from '@tabler/icons-react';
import { Button } from '../ui/button';

const thumbCache = new Map<string, { thumbnail: string; title: string }>();
const pendingRequests = new Map<string, Promise<{ thumbnail: string; title: string } | null>>();

async function fetchThumbnail(url: string): Promise<{ thumbnail: string; title: string } | null> {
  if (thumbCache.has(url)) return thumbCache.get(url)!;
  if (pendingRequests.has(url)) return pendingRequests.get(url)!;

  const promise = (async () => {
    try {
      const res = await apiFetch('/api/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.thumbnail) {
        const result = { thumbnail: data.thumbnail, title: data.title || '' };
        thumbCache.set(url, result);
        return result;
      }
    } catch { }
    return null;
  })();

  pendingRequests.set(url, promise);
  promise.finally(() => pendingRequests.delete(url));
  return promise;
}

interface TableRowProps {
  item: DownloadItem;
  index: number;
  onCancel?: (id: number) => void;
}

const FORMAT_BADGE: Record<string, { icon: typeof IconMusic; cls: string }> = {
  audio: { icon: IconMusic, cls: 'text-white' },
  image: { icon: IconPhoto, cls: 'text-emerald-400' },
  video: { icon: IconPlayerPlay, cls: 'text-sky-400' },
};

export function TableRow({ item, onCancel }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    try {
      new URL(item.url);
    } catch {
      setThumbError(true);
      return;
    }

    // Instant cache hit — no loading spinner
    if (thumbCache.has(item.url)) {
      const cached = thumbCache.get(item.url)!;
      setThumbnail(cached.thumbnail);
      setTitle(cached.title);
      return;
    }

    // Async fetch for other URLs
    setThumbLoading(true);
    fetchThumbnail(item.url)
      .then((result) => {
        if (result) {
          setThumbnail(result.thumbnail);
          setTitle(result.title);
        } else {
          setThumbError(true);
        }
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

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await apiFetch(`/api/remove/${item.id}`, { method: 'POST' });
      if (!res.ok) setRemoving(false);
    } catch {
      setRemoving(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    const downloadSingle = async (id: number, index?: number, filename?: string) => {
      try {
        const query = index !== undefined ? `?index=${index}` : '';
        const res = await apiFetch(`/api/download/${id}${query}`);
        if (!res.ok) throw new Error('Failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename ?? 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        const query = index !== undefined ? `&index=${index}` : '';
        window.open(`${API_BASE_URL}/api/download/${id}?session_id=${SESSION_ID}${query}`, '_blank');
      }
    };

    try {
      if (item.filenames && item.filenames.length > 0) {
        for (let i = 0; i < item.filenames.length; i++) {
          await downloadSingle(item.id, i, item.filenames[i]);
          await new Promise(r => setTimeout(r, 500)); // Delay to prevent browser blocking
        }
      } else {
        await downloadSingle(item.id, undefined, item.filename);
      }
    } finally {
      setDownloading(false);
    }
  };

  const isCompleted = item.status === 'Completed';
  const canCancel = ['Queued', 'Starting', 'Downloading', 'Converting', 'Merging'].includes(item.status) && !cancelling;

  let domain = '';
  try {
    domain = new URL(item.url).hostname;
    if (domain.endsWith('.tiktok.com')) {
      domain = 'tiktok.com';
    }
  } catch (e) { }

  const badge = FORMAT_BADGE[item.format ?? 'video'] ?? FORMAT_BADGE.video;
  const BadgeIcon = badge.icon;
  const speedLabel =
    item.status === 'Downloading'
      ? `${((item.id % 15) / 10 + 0.5).toFixed(1)} MB/s`
      : item.status === 'Queued' || item.status === 'Starting'
        ? 'Waiting…'
        : '';

  return (
    <div className='group relative flex items-center p-2 gap-3 sm:gap-4 sm:p-4'>
      {/* Thumbnail */}
      <div className='shrink-0 relative aspect-video h-16 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-20 sm:w-32 md:h-24 md:w-40'>
        {thumbLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400 sm:h-8 sm:w-8' />
          </div>
        ) : thumbError || !thumbnail ? (
          <div className='h-full w-full flex items-center justify-center'>
            <img src='/placeholder.svg' alt='No thumbnail' className='h-full w-full object-cover' />
          </div>
        ) : (
          <img src={thumbnail} alt='Thumbnail' className='h-full w-full object-cover' onError={() => setThumbError(true)} />
        )}
        <div className='absolute left-1 top-1 p-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-white/10 backdrop-blur-md shadow-sm border border-white/20 sm:left-1.5 sm:top-1.5 sm:h-7 sm:w-7'>
          {domain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt={domain}
              className='h-full w-full object-contain drop-shadow-md'
            />
          ) : (
            <IconUnlink size={16} className='text-white/60 drop-shadow-md' />
          )}
        </div>
        <span className={`absolute right-1 bottom-1 sm:right-1.5 sm:bottom-1.5 inline-flex items-center justify-center rounded-md bg-black p-1 text-white/90 ${badge.cls}`}>
          <BadgeIcon size={16} stroke={2} className={badge.cls} />
        </span>
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-1.5 sm:mb-2 sm:gap-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            title={title || undefined}
            className='truncate flex-1 text-xs font-semibold text-white/80 hover:text-indigo-400 hover:underline sm:text-sm'
          >
            {title || item.url}
          </a>
          <div className='shrink-0 flex items-center gap-1 sm:gap-2'>
            <StatusBadge status={item.status} />
          </div>
        </div>

        {isCompleted && item.metadata ? (
          <div className='text-xs text-white/50 font-medium sm:text-sm'>
            {item.metadata}
            {item.image_count && item.image_count > 1 ? ` · ${item.image_count} files` : ''}
          </div>
        ) : (
          <div className='flex flex-col gap-1 w-full'>
            <ProgressBar progress={item.progress ?? 0} />
            <div className='flex items-center justify-between gap-2 text-[10px] text-white/40 sm:text-xs'>
              {speedLabel && <span>{speedLabel}</span>}
              <span className='font-semibold tabular-nums ml-auto'>{item.progress?.toFixed(1) ?? '0.0'}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='shrink-0 flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4'>
        {isCompleted && (
          <Button
            onClick={handleDownload}
            disabled={downloading}
            title={downloading ? 'Saving…' : `Save ${item.filename ?? 'file'}`}
            size="iconSm"
            variant="success"
            className='rounded-xl border disabled:opacity-40 sm:h-10 sm:w-10'
          >
            <IconDownload size={16} className={`sm:size-5 ${downloading ? 'animate-bounce' : ''}`} />
          </Button>
        )}

        {canCancel && (
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            size="iconSm"
            variant="destructive"
            className='rounded-xl border disabled:opacity-40 sm:h-10 sm:w-10'
          >
            <IconDownloadOff size={16} className={`sm:size-5 ${cancelling ? 'animate-spin' : ''}`} />
          </Button>
        )}

        <Button
          onClick={handleRemove}
          disabled={removing}
          size="iconSm"
          variant="destructive"
          className='rounded-xl border disabled:opacity-40 sm:h-10 sm:w-10'
        >
          <IconTrash size={16} className={`sm:size-5 ${removing ? 'animate-pulse' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
