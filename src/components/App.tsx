import { useState, useEffect, useRef } from 'react';
import { PageHeader } from './PageHeader';
import { DownloadControls } from './DownloadControls';
import { DownloadTable } from './DownloadTable';

const RAW = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
export const API_BASE_URL = RAW.replace(/\/api$/, '').replace(/\/$/, '');

function getSessionId(): string {
  const key = 'vd_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid); 1
  }
  return sid;
}
export const SESSION_ID = getSessionId();

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE_URL}${path}${path.includes('?') ? '&' : '?'}session_id=${SESSION_ID}`, {
    ...init,
    headers: { 'X-Session-ID': SESSION_ID, ...(init?.headers ?? {}) },
  });

export interface DownloadItem {
  id: number;
  url: string;
  status: string;
  progress: number;
  error?: string;
  filename?: string;
  filepath?: string;
  format?: string;
  image_count?: number;
  metadata?: string;
}

export interface StatsData {
  total: number;
  completed: number;
  downloading: number;
  queue: DownloadItem[];
}

function getDownloadedIds(): Set<number> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem('vd_dl_ids') || '[]'));
  } catch {
    return new Set();
  }
}
function markDownloaded(id: number) {
  const ids = getDownloadedIds();
  ids.add(id);
  sessionStorage.setItem('vd_dl_ids', JSON.stringify([...ids]));
}

export default function VideoDownloader() {
  const [videoLink, setVideoLink] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [stats, setStats] = useState<StatsData>({ total: 0, completed: 0, downloading: 0, queue: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let es: EventSource;
    let retry: ReturnType<typeof setTimeout>;
    const connect = () => {
      es = new EventSource(`${API_BASE_URL}/api/events?session_id=${SESSION_ID}`);
      es.onmessage = (e) => {
        try {
          setStats(JSON.parse(e.data));
        } catch { }
      };
      es.onerror = () => {
        es.close();
        retry = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      es?.close();
      clearTimeout(retry);
    };
  }, []);

  useEffect(() => {
    stats.queue.forEach(async (item) => {
      if (item.status !== 'Completed' || !item.filename) return;
      if (getDownloadedIds().has(item.id)) return;
      markDownloaded(item.id);

      if (selectedDirectory) {
        try {
          const res = await apiFetch(`/api/download/${item.id}`);
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          const fh = await selectedDirectory.getFileHandle(item.filename, { create: true });
          const w = await fh.createWritable();
          await w.write(blob);
          await w.close();
          return;
        } catch { }
      }
      const a = document.createElement('a');
      a.href = `${API_BASE_URL}/api/download/${item.id}?session_id=${SESSION_ID}`;
      a.download = item.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }, [stats.queue, selectedDirectory]);

  const queueSingle = async (format: 'video' | 'audio' | 'image') => {
    const link = videoLink.trim();
    if (!link) return alert('Please enter a link');
    const res = await apiFetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [link], format }),
    });
    if (res.ok) {
      setStats(await res.json());
      setVideoLink('');
    }
  };

  const uploadList = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert('Choose a .txt file');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('format', 'video');
    const res = await apiFetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) {
      setStats(await res.json());
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearDownloads = async () => {
    const res = await apiFetch('/api/clear', { method: 'POST' });
    if (res.ok) {
      setStats(await res.json());
      setCurrentPage(1);
      sessionStorage.removeItem('vd_dl_ids');
    }
  };

  const cancelDownload = async (id: number) => {
    await apiFetch(`/api/cancel/${id}`, { method: 'POST' });
  };

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#0d0f1a] py-5 text-white sm:p-4 md:p-6'>
      {/* Ambient glow orbs */}
      <div className='pointer-events-none fixed inset-0 z-0'>
        <div className='absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl' />
        <div className='absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl' />
        <div className='absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl' />
      </div>

      <div className='relative z-10 mx-auto w-full max-w-7xl space-y-3 px-2 sm:space-y-4 sm:px-4 md:space-y-5'>
        <PageHeader />

        {/* Main input card */}
        <div className='rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-xl sm:p-4 md:rounded-3xl md:p-6'>
          <div className='mb-3 border-b border-white/10 pb-2 sm:mb-4 sm:pb-3'>
            <h2 className='text-xl font-medium text-white sm:text-lg md:text-2xl'>Paste links to start</h2>
          </div>
          <DownloadControls
            videoLink={videoLink}
            setVideoLink={setVideoLink}
            selectedDirectory={selectedDirectory}
            setSelectedDirectory={setSelectedDirectory}
            queueSingle={queueSingle}
            uploadList={uploadList}
            fileInputRef={fileInputRef}
          />
        </div>

        {/* Queue card */}
        <div className='rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-xl sm:p-4 md:rounded-3xl md:p-6'>
          <DownloadTable
            queue={stats.queue}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            setCurrentPage={setCurrentPage}
            setRowsPerPage={setRowsPerPage}
            clearDownloads={clearDownloads}
            cancelDownload={cancelDownload}
            completed={stats.completed}
            downloading={stats.downloading}
            total={stats.total}
          />
        </div>
      </div>
    </div>
  );
}
