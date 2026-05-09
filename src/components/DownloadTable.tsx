import { TableRow } from './TableRow';
import { TablePagination } from './TablePagination';
import type { DownloadItem } from './App';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface DownloadTableProps {
  queue: DownloadItem[];
  currentPage: number;
  rowsPerPage: number;
  setCurrentPage: (p: number) => void;
  setRowsPerPage: (r: number) => void;
  clearDownloads: () => void;
  cancelDownload: (id: number) => void;
  completed: number;
  downloading: number;
  total: number;
}

export function DownloadTable({
  queue,
  currentPage,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  clearDownloads,
  cancelDownload,
  completed,
  downloading,
  total,
}: DownloadTableProps) {
  const queued = queue.filter((q) => q.status === 'Queued').length;
  const failed = Math.max(0, total - completed - downloading - queued);

  const start = (currentPage - 1) * rowsPerPage;
  const paginated = queue.slice(start, start + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(queue.length / rowsPerPage));

  const pills = [
    { label: 'Done', value: completed, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { label: 'Loading', value: downloading, cls: 'bg-indigo-500/15  text-indigo-400  border-indigo-500/30' },
    { label: 'Queued', value: queued, cls: 'bg-amber-500/15   text-amber-400   border-amber-500/30' },
    { label: 'Failed', value: failed, cls: 'bg-rose-500/15    text-rose-400    border-rose-500/30' },
  ];

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Header: title + pills + clear */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-xl font-semibold text-white sm:text-lg md:text-2xl'>Download Queue</h2>
        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
          {pills.map((p) => (
            <span key={p.label} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${p.cls}`}>
              {p.value} {p.label}
            </span>
          ))}
        </div>
      </div>
      <div className='flex items-center justify-between'>
        <p className='font-medium text-white/30'>
          {queue.length > 0 ? `${queue.length} item${queue.length > 1 ? 's' : ''} in queue` : 'Queue is empty'}
        </p>
        <button
          onClick={clearDownloads}
          title='Clear all'
          className='flex items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-500/15 px-2 py-1 text-red-400 transition-colors hover:bg-red-500/25'
        >
          <p className='text-sm'>Clear</p>
          <HugeiconsIcon icon={Delete02Icon} size={16} />
        </button>
      </div>

      {/* Items or empty state */}
      {paginated.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-10 text-center'>
          <p className='text-sm font-semibold text-white/50'>No downloads yet</p>
          <p className='text-xs text-white/25'>Paste a URL above to start</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {paginated.map((item, i) => (
            <TableRow key={item.id} item={item} index={i} onCancel={cancelDownload} />
          ))}
        </div>
      )}

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setCurrentPage={setCurrentPage}
        setRowsPerPage={setRowsPerPage}
        totalItems={queue.length}
      />
    </div>
  );
}
