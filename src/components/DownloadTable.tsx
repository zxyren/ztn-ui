import { useState } from 'react';
import { TableRow } from './TableRow';
import { TablePagination } from './TablePagination';
import type { DownloadItem } from './App';
import { IconTrash, IconChevronDown } from '@tabler/icons-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../ui/dropdown-menu';

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
}: DownloadTableProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'done' | 'loading' | 'queued' | 'failed'>('all');

  const completedCount = queue.filter((q) => q.status === 'Completed').length;
  const downloadingCount = queue.filter((q) => q.status === 'Downloading').length;
  const queuedCount = queue.filter((q) => q.status === 'Queued').length;
  const failedCount = queue.filter((q) => ['Error', 'Cancelled'].includes(q.status)).length;

  const tabs = [
    {
      label: 'All',
      key: 'all' as const,
      count: queue.length,
      filter: () => true,
    },
    {
      label: 'Done',
      key: 'done' as const,
      count: completedCount,
      filter: (item: DownloadItem) => item.status === 'Completed',
    },
    {
      label: 'Loading',
      key: 'loading' as const,
      count: downloadingCount,
      filter: (item: DownloadItem) => item.status === 'Downloading',
    },
    {
      label: 'Queued',
      key: 'queued' as const,
      count: queuedCount,
      filter: (item: DownloadItem) => item.status === 'Queued',
    },
    {
      label: 'Failed',
      key: 'failed' as const,
      count: failedCount,
      filter: (item: DownloadItem) => ['Error', 'Cancelled'].includes(item.status),
    },
  ];

  const activeTabData = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const filteredQueue = queue.filter(activeTabData.filter);
  const start = (currentPage - 1) * rowsPerPage;
  const paginated = filteredQueue.slice(start, start + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / rowsPerPage));
  const statusLabel = activeTabData.label === 'All' ? 'items' : activeTabData.label.toLowerCase();

  return (
    <div className='space-y-3 sm:space-y-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold text-white sm:text-lg md:text-2xl'>Download Queue</h2>
          <p className='text-sm text-slate-400'>Filter the queue by status and focus on the items you need right now.</p>
        </div>

        {/* Mobile Dropdown (visible on tablet/mobile) */}
        <div className='md:hidden'>
          <DropdownMenu>
            <DropdownMenuTrigger className='flex w-full appearance-none items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-white outline-none ring-white/5 transition-all hover:bg-white/5 focus:border-indigo-500/60 focus:bg-white/5'>
              <span>
                {activeTabData.label} ({activeTabData.count})
              </span>
              <IconChevronDown size={18} stroke={1.5} className='text-slate-400' />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={activeTab}
                onValueChange={(val) => {
                  setActiveTab(val as any);
                  setCurrentPage(1);
                }}
              >
                {tabs.map((tab) => (
                  <DropdownMenuRadioItem key={tab.key} value={tab.key}>
                    {tab.label} ({tab.count})
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Tabs (visible on desktop) */}
        <div className='hidden rounded-full bg-slate-950/40 p-2 ring-1 ring-white/10 shadow-inner md:block'>
          <div className='flex flex-wrap items-center justify-center gap-2 sm:justify-start'>
            {tabs.map((tab) => {
              const selected = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex min-w-16 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition duration-200 sm:px-4 sm:py-2 sm:text-sm ${selected ? 'bg-white text-slate-950 border-transparent shadow-sm shadow-white/10' : 'border-transparent text-slate-300 hover:text-white hover:bg-white/10'}`}
                >
                  <span>{tab.label}</span>
                  <span className={`inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full px-2 text-[0.65rem] font-semibold ${selected ? 'bg-slate-300 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className='flex items-center justify-between pt-2'>
        <p className='text-sm font-medium text-slate-400'>
          {filteredQueue.length > 0 ? `${filteredQueue.length} ${statusLabel} in queue` : 'Queue is empty'}
        </p>
        <Button
          onClick={clearDownloads}
          variant='destructive'
          className='rounded-xl flex items-center gap-1'
        >
          <IconTrash size={18} stroke={1.5} />
          <span>Clear</span>
        </Button>
      </div>

      {/* Items or empty state */}
      {paginated.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-10 text-center'>
          <h1 className='text-2xl font-medium text-white/50'>No downloads yet</h1>
          <p className='text-white/25'>Paste a URL above to start</p>
        </div>
      ) : (
        <div className='space-y-0'>
          {paginated.map((item, i) => (
            <div key={item.id} className='space-y-3'>
              <TableRow item={item} index={i} onCancel={cancelDownload} />
              {i < paginated.length - 1 && <Separator className='bg-background/30' />}
            </div>
          ))}
        </div>
      )}

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setCurrentPage={setCurrentPage}
        setRowsPerPage={setRowsPerPage}
        totalItems={filteredQueue.length}
      />
    </div>
  );
}
