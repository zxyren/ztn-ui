import { useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconClipboardPlus, IconFolder, IconFolderFilled, IconMusic, IconPhoto, IconPlayerPlay, IconTrash, IconFileText } from '@tabler/icons-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (v: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (h: FileSystemDirectoryHandle | null) => void;
  queueSingle: (format: 'video' | 'audio' | 'image', asZip: boolean) => void;
  uploadList: (asZip: boolean) => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const inputBase =
  'w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all focus:border-white/60 backdrop-blur-sm';

export function DownloadControls({
  videoLink,
  setVideoLink,
  selectedDirectory,
  setSelectedDirectory,
  queueSingle,
  uploadList,
  fileInputRef,
}: DownloadControlsProps) {
  const [asZip, setAsZip] = useState(true);

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
      icon: IconPlayerPlay,
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
              onKeyDown={(e) => e.key === 'Enter' && queueSingle('video', asZip)}
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
              <h1 className='text-sm'>Paste</h1>
            </Button>
          </div>

          {/* Format buttons */}
          <div className='flex'>
            {formatButtons.map(({ fmt, icon: Icon, label, cls }) => (
              <button
                key={fmt}
                onClick={() => queueSingle(fmt, asZip)}
                className={`flex h-10 flex-1 items-center cursor-pointer justify-center gap-1.5 border px-3 text-sm font-semibold transition-all sm:h-12 sm:px-5 sm:text-sm ${cls}`}
              >
                <Icon size={20} className='sm:size-6' stroke={1.5} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4 sm:pt-5'>
        {/* Left Side: Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="as-zip-checkbox"
            checked={asZip}
            onCheckedChange={setAsZip}
          />
          <label
            htmlFor="as-zip-checkbox"
            className="text-sm text-slate-300 cursor-pointer select-none hover:text-white transition-colors"
          >
            Download multiple images as ZIP archive
          </label>
        </div>

        {/* Right Side: Set Save Location and Batch Upload */}
        <div className='flex flex-col sm:flex-row items-center gap-2'>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <button
              type='button'
              onClick={handleSelectDirectory}
              className='flex h-11 flex-1 items-center cursor-pointer justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:flex-none'
            >
              <AnimatePresence mode='popLayout'>
                {selectedDirectory ? (
                  <motion.div
                    key='sel'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className='flex items-center gap-1.5'
                  >
                    <IconFolderFilled size={18} className='text-primary' />
                    <span className='truncate max-w-36 sm:max-w-52 text-white'>
                      {selectedDirectory.name}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key='def'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex items-center gap-1.5'
                  >
                    <IconFolder size={18} />
                    <span>Set Save Location</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {selectedDirectory && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSelectedDirectory(null)}
                  className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20'
                >
                  <IconTrash size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className='flex items-center w-full sm:w-auto'>
            <input ref={fileInputRef} type='file' accept='.txt' className='hidden' id='batch-file' onChange={() => uploadList(asZip)} />
            <label
              htmlFor='batch-file'
              className='flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:w-auto'
            >
              <IconFileText size={18} />
              <span>Batch Upload (.txt)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
