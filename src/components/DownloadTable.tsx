import { TableRow } from './TableRow';
import { TablePagination } from './TablePagination';
import type { DownloadItem } from './App';
import { IconTrash } from '@tabler/icons-react';

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
    { label: 'Loading', value: downloading, cls: 'bg-indigo-400/15  text-indigo-400  border-indigo-400/30' },
    { label: 'Queued', value: queued, cls: 'bg-amber-500/15   text-amber-400   border-amber-500/30' },
    { label: 'Failed', value: failed, cls: 'bg-rose-500/15    text-rose-400    border-rose-500/30' },
  ];

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Header: title + pills + clear */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-xl font-medium text-white sm:text-lg md:text-2xl'>Download Queue</h2>
        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
          {pills.map((p) => (
            <span key={p.label} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${p.cls}`}>
              {p.value} {p.label}
            </span>
          ))}
        </div>
      </div>
      <div className='flex items-center justify-between'>
        <p className='text-white/50'>
          {queue.length > 0 ? `${queue.length} item${queue.length > 1 ? 's' : ''} in queue` : 'Queue is empty'}
        </p>
        <button
          onClick={clearDownloads}
          title='Clear all'
          className='flex items-center justify-center gap-1 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-1.5 active:scale-95 duration-200 transition-transform text-red-400 hover:bg-red-500/25'
        >
          <p className='text-base font-medium'>Clear</p>
          <IconTrash size={20} stroke={1.5} />
        </button>
      </div>

      {/* Items or empty state */}
      {paginated.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-10 text-center'>
          <h1 className='text-2xl font-medium text-white/50'>No downloads yet</h1>
          <p className='text-white/25'>Paste a URL above to start</p>
        </div>
      ) : (
        <div>
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
