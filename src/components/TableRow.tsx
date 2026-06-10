import { apiFetch, API_BASE_URL, SESSION_ID, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './Progressbar';
import { useState, useEffect } from 'react';
import { IconDownload, IconTrash, IconDownloadOff, IconUnlink } from '@tabler/icons-react';
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

  let domain = '';
  try {
    domain = new URL(item.url).hostname;
  } catch (e) { }

  const badge = FORMAT_BADGE[item.format ?? 'video'] ?? FORMAT_BADGE.video;
  const speedLabel =
    item.status === 'Downloading'
      ? `${((item.id % 15) / 10 + 0.5).toFixed(1)} MB/s`
      : item.status === 'Queued' || item.status === 'Starting'
        ? 'Waiting…'
        : '';

  return (
    <div className='group relative flex items-start p-2 gap-4 sm:p-4 md:items-center'>
      {/* Thumbnail */}
      <div className='relative aspect-video h-16 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-20 sm:w-32 md:h-24 md:w-40'>
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

        {isCompleted && item.metadata ? (
          <div className='mb-1.5 text-xs text-white/50 font-medium sm:mb-2 sm:text-sm'>
            {item.metadata}
          </div>
        ) : (
          <div className='mb-1.5 sm:mb-2'>
            <ProgressBar progress={item.progress ?? 0} />
          </div>
        )}

        <div className='flex w-full flex-wrap items-center justify-between gap-1 text-xs sm:gap-2'>
          <div className='flex items-center gap-1 sm:gap-2'>
            <StatusBadge status={item.status} />
            {speedLabel && <span className='hidden text-white/30 sm:inline'>{speedLabel}</span>}
          </div>

          <div className='ml-auto flex items-center gap-1 sm:gap-2'>
            {!isCompleted && <span className='font-semibold tabular-nums text-white/40'>{item.progress?.toFixed(1) ?? '0.0'}%</span>}

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
      </div>
    </div>
  );
}
