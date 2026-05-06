import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  totalItems: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  totalItems,
}: TablePaginationProps) {
  const handleRowsChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-4'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white sm:gap-2 sm:rounded-xl sm:text-sm'>
              <span className='hidden text-white/30 sm:inline'>Show</span>
              <span className='font-semibold text-white/70'>{rowsPerPage}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-40 border border-white/10 bg-[#0d0f1a]/90 backdrop-blur-xl'>
            <DropdownMenuLabel className='text-xs text-white/40'>Rows per page</DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-white/10' />
            {[5, 15, 25, 50].map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => handleRowsChange(value)}
                className='flex justify-between text-white/60 hover:text-white focus:text-white'
              >
                {value}
                {rowsPerPage === value && <HugeiconsIcon icon={Tick02Icon} size={15} className='text-emerald-400' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className='hidden text-xs text-white/30 sm:inline sm:text-sm'>
          {totalItems > 0 ? (
            <>
              <span className='text-white/60'>{startItem}</span>
              {'–'}
              <span className='text-white/60'>{endItem}</span>
              {' of '}
              <span className='font-medium text-white/60'>{totalItems}</span>
            </>
          ) : (
            'No items'
          )}
        </span>
      </div>

      <div className='flex items-center gap-1 sm:gap-2'>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className='flex h-8 items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-30 sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm'
        >
          <HugeiconsIcon size={14} icon={ArrowLeft01Icon} className='sm:size-4' />
          <span className='ml-0.5 hidden sm:inline'>Previous</span>
        </button>

        <div className='flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs sm:h-9 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:text-sm'>
          <span className='text-white/30'>Pg</span>
          <span className='font-bold text-indigo-400'>{currentPage}</span>
          <span className='text-white/20'>/</span>
          <span className='font-medium text-white/50'>{totalPages}</span>
        </div>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='flex h-8 items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-30 sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm'
        >
          <span className='mr-0.5 hidden sm:inline'>Next</span>
          <HugeiconsIcon size={14} icon={ArrowRight01Icon} className='sm:size-4' />
        </button>
      </div>
    </div>
  );
}
