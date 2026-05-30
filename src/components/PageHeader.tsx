import { Icon } from 'iconza';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { BadgeQuestionMark } from 'lucide-react';

const supportedPlatforms = [
  { name: 'Facebook', icon: 'FacebookSquare' },
  { name: 'TikTok', icon: 'TikTok' },
  { name: 'Instagram', icon: 'Instagram' },
  { name: 'Pinterest', icon: 'Pinterest' },
  { name: 'X', icon: 'X Light' },
  { name: 'Dailymotion', icon: 'Dailymotion Light' },
  { name: 'LinkedIn', icon: 'LinkedIn' },
  { name: 'Reddit', icon: 'Reddit' },
  { name: 'Twitch', icon: 'Twitch' },
  { name: 'Snapchat', icon: 'Snapchat' },
  { name: 'VK', icon: 'VK' },
  { name: 'RedNote', icon: 'RedNote' },
  { name: 'Bilibili', icon: 'Bilibili' },
  { name: 'Vimeo', icon: 'Vimeo' },
  { name: 'CapCut', icon: 'CapCut' },
  { name: 'Kwai', icon: 'Kwai' },
  { name: 'Behance', icon: 'BehanceFill' },
  { name: 'Dribbble', icon: 'Dribbble' },
  { name: '500px', icon: '500px Light' },
  { name: 'Bluesky', icon: 'Bluesky' },
];

export function PageHeader() {
  return (
    <div className='mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4'>
      <div className='flex items-center gap-2'>
        <img src='/logo.png' alt='Logo' className='h-9 w-9 sm:h-11 sm:w-11' />
        <h1 className='text-2xl font-medium tracking-tight text-white sm:text-3xl'>ZTN</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='flex select-none items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white sm:text-sm'>
            <span className='hidden sm:inline'>Supported Services</span>
            <span className='sm:hidden'>Services</span>
            <BadgeQuestionMark size={23} strokeWidth={1.5} className='text-indigo-400' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='mr-3 w-56 border border-white/10 bg-[#0d0f1a]/90 p-2 backdrop-blur-xl sm:w-80'>
          <DropdownMenuLabel className='text-sm font-semibold text-indigo-400'><h1>Supported Platforms</h1></DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-white/10' />
          <div className='grid grid-cols-3 gap-1 p-2 sm:grid-cols-4 sm:gap-2'>
            {supportedPlatforms.map((platform) => (
              <div
                key={platform.name}
                className='hover:bg-white/8 flex cursor-pointer flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors sm:rounded-xl sm:p-2'
              >
                <Icon name={platform.icon} className='h-4 w-4 sm:h-6 sm:w-6' />
                <span className='text-xs font-medium text-white/50 sm:text-sm'>{platform.name}</span>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
