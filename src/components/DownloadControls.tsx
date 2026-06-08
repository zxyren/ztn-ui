import { type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconBrandYoutube, IconClipboardPlus, IconFolder, IconFolderFilled, IconMusic, IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react';
import { Button } from '../ui/button';

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (v: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (h: FileSystemDirectoryHandle | null) => void;
  queueSingle: (format: 'video' | 'audio' | 'image') => void;
  uploadList: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const inputBase =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/8 backdrop-blur-sm';

export function DownloadControls({
  videoLink,
  setVideoLink,
  selectedDirectory,
  setSelectedDirectory,
  queueSingle,
  uploadList,
  fileInputRef,
}: DownloadControlsProps) {
  const handleSelectDirectory = async () => {
    if (!('showDirectoryPicker' in window)) return alert('Directory picker not supported. Use Chrome, Edge, or Opera.');
    try {
      setSelectedDirectory(await (window as any).showDirectoryPicker({ mode: 'readwrite' }));
    } catch (e: any) {
      if (e.name !== 'AbortError') alert('Failed to select directory.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
          new URL(trimmed);
          setVideoLink(trimmed);
        } catch { /* silent */ }
      }
    } catch {
      /* silent */
    }
  };

  const formatButtons = [
    {
      fmt: 'video' as const,
      icon: IconBrandYoutube,
      label: 'MP4',
      cls: 'rounded-l-xl rounded-r-none border-r-0 border-lime-400/40 bg-lime-500/20 hover:bg-lime-400/30 text-lime-400',
    },
    {
      fmt: 'audio' as const,
      icon: IconMusic,
      label: 'MP3',
      cls: 'rounded-none border-x-0 border-indigo-400/40 bg-indigo-500/20 hover:bg-indigo-400/30 text-indigo-400',
    },
    {
      fmt: 'image' as const,
      icon: IconPhoto,
      label: 'IMG',
      cls: 'rounded-r-xl rounded-l-none border-l-0 border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* URL Input */}
      <div>
        <div className='flex flex-col gap-2 sm:flex-row sm:gap-3'>
          <div className='relative flex-1'>
            <input
              className={`h-11 min-w-0 pr-24 sm:h-14 sm:pr-28 ${inputBase}`}
              type='text'
              placeholder='Paste video, audio, or image URL…'
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queueSingle('video')}
              onFocus={() => {
                if (!videoLink) handlePaste();
              }}
            />
            <Button
              variant='secondary'
              onClick={handlePaste}
              className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 px-2 py-0 sm:h-10 sm:px-3 sm:text-base active:scale-95 duration-200 transition-transform'
            >
              <IconClipboardPlus size={20} stroke={1.5} />
              <span>Paste</span>
            </Button>
          </div>

          {/* Format buttons */}
          <div className='flex'>
            {formatButtons.map(({ fmt, icon: Icon, label, cls }) => (
              <button
                key={fmt}
                onClick={() => queueSingle(fmt)}
                className={`flex h-10 flex-1 items-center cursor-pointer justify-center gap-1.5 border px-3 text-sm font-semibold transition-all sm:h-12 sm:px-5 sm:text-sm ${cls}`}
              >
                <Icon size={20} className='sm:size-6' stroke={1.5} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Folder + Batch Upload */}
      <div className='grid gap-3 border-t border-white/10 pt-4 sm:gap-3 sm:pt-5 lg:grid-cols-2'>
        {/* Save Location */}
        <div className='space-y-2 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:rounded-2xl sm:p-3'>
          <div>
            <h1 className='text-xs font-semibold uppercase tracking-wider text-white/40 sm:text-base'>Save Location</h1>
            <p className='text-sm text-white/25 sm:text-base'>Choose where completed files are saved.</p>
          </div>
          <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-2'>
            <motion.button
              layout
              type='button'
              onClick={handleSelectDirectory}
              className='flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white sm:min-h-11 sm:rounded-xl sm:px-4 sm:text-sm'
            >
              <AnimatePresence mode='popLayout'>
                {selectedDirectory ? (
                  <motion.span
                    key='sel'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className='flex min-w-0 items-center truncate'
                  >
                    <IconFolderFilled size={16} className='mr-1.5 shrink-0 text-indigo-400 sm:size-5' />
                    <span className='truncate font-semibold text-white'>{selectedDirectory.name}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key='def'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex items-center gap-1.5 font-medium'
                  >
                    <IconFolder size={16} className='sm:size-5' />
                    <h1 className='text-sm font-medium text-white/60 sm:text-base'>
                      <span className='hidden sm:inline'>Choose</span> Folder
                    </h1>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {selectedDirectory && (
                <Button
                  variant='destructive'
                  onClick={() => setSelectedDirectory(null)}
                >
                  <IconTrash size={16} className='sm:size-5' />
                  <span className='hidden sm:inline'>Clear</span>
                </Button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Batch Upload */}
        <div className='space-y-2 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:space-y-2.5 sm:rounded-2xl sm:p-3'>
          <div>
            <h1 className='text-xs font-semibold uppercase tracking-wider text-white/40 sm:text-base'>Batch Upload</h1>
            <p className='text-sm text-white/25 sm:text-base'>
              Drop a <span className='rounded font-mono bg-white/10 px-1 py-0.5 italic text-white/50'>.txt</span> file with many URLs.
            </p>
          </div>
          <input ref={fileInputRef} type='file' accept='.txt' className='hidden' id='batch-file' onChange={uploadList} />
          <label
            htmlFor='batch-file'
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-indigo-500/40', 'bg-indigo-500/10');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-indigo-500/40', 'bg-indigo-500/10');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-indigo-500/40', 'bg-indigo-500/10');
              if (fileInputRef.current && e.dataTransfer.files.length > 0) {
                fileInputRef.current.files = e.dataTransfer.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
            className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/15 p-4 text-center transition-all hover:border-indigo-400/50 sm:rounded-2xl sm:p-6'
          >
            <div className='flex items-center justify-center rounded-full bg-indigo-400/10 p-4 transition-all duration-300'>
              <IconUpload size={28} className='text-indigo-400' />
            </div>
            <div>
              <h1 className='text-sm font-medium text-white/60 sm:text-base'>Drop your file here, or <span className='text-indigo-400'>browse</span></h1>
              <p className='text-sm font-light text-white/50'>or click to browse</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
