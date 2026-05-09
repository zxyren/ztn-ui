import { Unlink04Icon } from '@hugeicons/core-free-icons';

type PlatformIcon = { type: 'iconza'; name: string } | { type: 'hugeicons'; icon: typeof Unlink04Icon };

export const getPlatformIcon = (url: string): PlatformIcon => {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes('youtube.com') || host === 'youtu.be') return { type: 'iconza', name: 'YouTube' };
    if (host.includes('facebook.com')) return { type: 'iconza', name: 'FacebookSquare' };
    if (host.includes('tiktok.com')) return { type: 'iconza', name: 'TikTokFill' };
    if (host.includes('instagram.com')) return { type: 'iconza', name: 'Instagram' };
    if (host.includes('pin.it')) return { type: 'iconza', name: 'Pinterest' };
    if (host === 'x.com' || host.includes('twitter.com')) return { type: 'iconza', name: 'X Light' };
    if (host.includes('linkedin.com')) return { type: 'iconza', name: 'LinkedIn' };
    if (host.includes('reddit.com')) return { type: 'iconza', name: 'Reddit' };
    if (host.includes('twitch.tv')) return { type: 'iconza', name: 'Twitch' };
    if (host.includes('snapchat.com')) return { type: 'iconza', name: 'Snapchat' };
    if (host === 'vk.com') return { type: 'iconza', name: 'VK' };
    if (host.includes('xiaohongshu.com')) return { type: 'iconza', name: 'RedNote' };
    if (host.includes('bilibili.com')) return { type: 'iconza', name: 'Bilibili' };
    if (host.includes('vimeo.com')) return { type: 'iconza', name: 'Vimeo' };
    if (host.includes('capcut.com')) return { type: 'iconza', name: 'CapCut' };
    if (host.includes('kwai.com')) return { type: 'iconza', name: 'Kwai' };
    if (host.includes('behance.net')) return { type: 'iconza', name: 'BehanceFill' };
    if (host.includes('dribbble.com')) return { type: 'iconza', name: 'Dribbble' };
    if (host === 'dai.ly' || host.includes('dailymotion.com')) return { type: 'iconza', name: 'Dailymotion Light' };
    if (host.includes('500px.com')) return { type: 'iconza', name: '500px Light' };
    if (host.includes('bsky.app')) return { type: 'iconza', name: 'Bluesky' };
    if (host.includes('rutube.ru')) return { type: 'iconza', name: 'Rutube' };
  } catch (e) {}
  return { type: 'hugeicons', icon: Unlink04Icon };
};
