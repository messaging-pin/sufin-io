import React, { useState, useRef } from 'react';
import {
  Search,
  Camera,
  Mic,
  ChevronDown,
  Plus,
  Compass,
  LayoutGrid,
  Bell,
  Settings,
  Share2,
  MoreHorizontal,
  Home,
  MessageCircleMore
} from 'lucide-react';
import { FaPinterest } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface Pin {
  id: string;
  title: string;
  imageUrl: string;
  aspectRatio?: string;
  saved?: boolean;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'
];

const INITIAL_PINS: Pin[] = [
  {
    id: 'pin-1',
    title: 'Cat drinking Pepsi with headset 🎧',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-2',
    title: 'The Psychology of Money & Chess setup',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-3',
    title: 'Alpine grass mountain trail trekker',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-4',
    title: 'Japanese Sumi-e solitary pine on mist cliff',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-5',
    title: 'Dark dramatic storm clouds aesthetic',
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    id: 'pin-6',
    title: 'Luxury noir perfume collection setup',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-7',
    title: 'Motivational focus mindset dark quote',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-8',
    title: 'Lawson convenience store under Mt Fuji Japan',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-9',
    title: 'Dark iOS UI widget concept screens',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-10',
    title: 'Creative school digital planner iPad setup',
    imageUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[1/1]'
  },
  {
    id: 'pin-11',
    title: 'Samurai warrior under blood red full moon',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-12',
    title: 'Puppy looking at sunny blue sky hill',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-13',
    title: 'Minimalist brutalist concrete architecture',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-14',
    title: 'Tokyo neon cyberpunk rainy street at night',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-15',
    title: 'Artisan matcha latte art with pastry',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[1/1]'
  },
  {
    id: 'pin-16',
    title: 'Vintage sports car on scenic mountain road',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    id: 'pin-17',
    title: 'Cozy rain window reading coffee corner',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-18',
    title: 'Editorial high fashion studio portrait',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-19',
    title: 'Kyoto bamboo forest golden hour sunlight path',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-20',
    title: 'Bioluminescent deep ocean blue waters',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-21',
    title: 'Sahara golden desert sunset sand dunes',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-22',
    title: 'Liquid 3D holographic crystal spheres',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[1/1]'
  },
  {
    id: 'pin-23',
    title: 'Vintage mechanical camera & timepiece flatlay',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-24',
    title: 'Neon vaporwave retro palm sunset gradient',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    id: 'pin-25',
    title: 'Dark academia vintage library bookshelf study',
    imageUrl: 'https://images.unsplash.com/photo-1507842229451-2292f7b88939?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-26',
    title: 'Cyberpunk neon portrait with blue reflections',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-27',
    title: 'Espresso martini cocktail with roasted beans',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-28',
    title: 'Scandinavian minimalist living room design',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-29',
    title: 'Sunset over Santorini white cliff domes Greece',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-30',
    title: 'Matte black superbike on racing track',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    id: 'pin-31',
    title: 'Serene misty pine forest mountains sunrise',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-32',
    title: 'Authentic Japanese ramen bowl with egg',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-33',
    title: 'Streetwear sneakerhead shoe collection aesthetic',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[1/1]'
  },
  {
    id: 'pin-34',
    title: 'Glowing neon arcade retro gaming hallway',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-35',
    title: 'Icelandic black sand beach & basalt cliff columns',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-36',
    title: 'Minimalist typography graphic design poster',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-37',
    title: 'Golden retriever enjoying colorful autumn leaves',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-38',
    title: 'Dark luxury Swiss chronograph wristwatch',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[1/1]'
  },
  {
    id: 'pin-39',
    title: 'Cherry blossoms blooming in Tokyo temple garden',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-40',
    title: 'Minimalist glass coffee pour-over kettle drip',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-41',
    title: 'Futuristic cityscape flying drone traffic',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    id: 'pin-42',
    title: 'Sunset surf session silhouette riding ocean wave',
    imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-43',
    title: 'Clean modern workspace MacBook desk setup',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-44',
    title: 'Retro vintage vinyl record turntable spinning',
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[1/1]'
  },
  {
    id: 'pin-45',
    title: 'Swiss emerald mountain lake mirror reflection',
    imageUrl: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-46',
    title: 'Luxury sports coupe taillights highway drive',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    id: 'pin-47',
    title: 'Minimalist botanical floral line art drawing',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-48',
    title: 'Parisian rooftop view of golden hour Eiffel Tower',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-49',
    title: 'Dark fantasy celestial dragon nebula art',
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  },
  {
    id: 'pin-50',
    title: 'Warm campfire glowing under starry Milky Way galaxy',
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[9/16]'
  },
  {
    id: 'pin-51',
    title: 'Artisan golden crust sourdough bakery loaves',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[4/5]'
  },
  {
    id: 'pin-52',
    title: 'Hong Kong neon sign night alley reflections',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    aspectRatio: 'aspect-[3/4]'
  }
];

// Fisher-Yates array shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface PinterestFeedProps {
  onOpenMessages: () => void;
}

export const PinterestFeed: React.FC<PinterestFeedProps> = ({ onOpenMessages }) => {
  const { user, profile } = useAuth();

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Al Sam';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AI';
  const hasRealPhoto = Boolean(
    avatarUrl &&
    !avatarUrl.includes('unsplash.com/photo-1534528741775-53994a69daeb') &&
    !avatarUrl.includes('unsplash.com/photo-1535713875002-d1d0cf377fde')
  );

  // Initialize with randomized pin order
  const [pins, setPins] = useState<Pin[]>(() => shuffleArray(INITIAL_PINS));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState<'home' | 'explore' | 'collages' | 'create' | 'notifications' | 'messages'>('home');
  const [activeTab, setActiveTab] = useState('All');
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newPin: Pin = {
        id: `pin-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: url,
        aspectRatio: 'aspect-[4/5]'
      };
      setPins([newPin, ...pins]);
    }
  };

  const handleSavePin = (pinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPins(prev => prev.map(p => p.id === pinId ? { ...p, saved: !p.saved } : p));
  };

  const filteredPins = pins.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-white text-zinc-900 font-sans overflow-hidden select-none">
      {/* 1. Left Pinterest Sidebar Navigation */}
      <aside className="w-[72px] h-full flex flex-col items-center justify-between py-4 border-r border-zinc-200 bg-white z-30 flex-shrink-0">
        {/* Top Icons */}
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Pinterest Logo */}
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center text-[#E60023] hover:bg-zinc-100 transition active:scale-95"
            title="Pinterest"
          >
            <FaPinterest className="w-8 h-8" />
          </button>

          {/* Home */}
          <button
            onClick={() => setActiveNav('home')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition active:scale-95"
            title="Home"
          >
            <Home className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Explore / Compass */}
          <button
            onClick={() => setActiveNav('explore')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition active:scale-95"
            title="Explore"
          >
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Collages / Split layout */}
          <button
            onClick={() => setActiveNav('collages')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition active:scale-95"
            title="Collages"
          >
            <LayoutGrid className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Create / Upload Pin */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition active:scale-95"
            title="Create / Upload Pin"
          >
            <Plus className="w-6 h-6 stroke-[2.4]" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveNav('notifications')}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${
              activeNav === 'notifications'
                ? 'text-zinc-950 bg-zinc-100 font-bold'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Messages Button */}
          <button
            onClick={onOpenMessages}
            className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition active:scale-95"
            title="Messages"
          >
            <MessageCircleMore className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Bottom Settings */}
        <div className="flex flex-col items-center space-y-2">
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition active:scale-95"
            title="Settings"
          >
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Hidden upload input */}
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </aside>

      {/* 2. Main Pinterest Content Pane */}
      <main className="flex-1 h-full flex flex-col min-w-0 bg-white overflow-hidden">
        {/* Top Pinterest Search Bar Header */}
        <header className="w-full px-6 py-3 flex items-center space-x-4 bg-white z-20">
          {/* Search Pill Input */}
          <div className="flex-1 relative flex items-center bg-[#e9e9e9] hover:bg-[#dedede] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7cbdfc]/40 rounded-full px-4 py-2.5 transition">
            <Search className="w-5 h-5 text-zinc-500 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[16px] text-zinc-900 placeholder-zinc-500 font-normal focus:outline-none"
            />
            {/* Visual Camera Search */}
            <button
              onClick={() => uploadInputRef.current?.click()}
              className="p-1 text-zinc-600 hover:text-zinc-900 transition flex-shrink-0"
              title="Search by image"
            >
              <Camera className="w-5 h-5 stroke-[2]" />
            </button>
            {/* Microphone Voice Search */}
            <button
              className="p-1 text-zinc-600 hover:text-zinc-900 transition flex-shrink-0 ml-1"
              title="Search by voice"
            >
              <Mic className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* User Profile Avatar with dropdown arrow */}
          <div className="flex items-center space-x-1 cursor-pointer group flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm shadow-sm group-hover:opacity-90 border border-zinc-200">
              {hasRealPhoto ? (
                <img src={avatarUrl!} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#a855f7] to-[#ec4899] text-white flex items-center justify-center text-xs font-extrabold shadow-inner">
                  {initials}
                </div>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition" />
          </div>
        </header>

        {/* Subheader Filter Tabs */}
        <div className="px-6 py-2 flex items-center space-x-6 border-b border-zinc-100 bg-white">
          <button
            onClick={() => setActiveTab('All')}
            className={`pb-1.5 text-[15px] font-bold tracking-tight transition relative ${
              activeTab === 'All'
                ? 'text-zinc-900 border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            All
          </button>
        </div>

        {/* 3. Pinterest Masonry Grid Feed (Tight image bounds with 0 bottom gaps) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
            {filteredPins.map((pin, index) => {
              const isHovered = hoveredPinId === pin.id;

              return (
                <div
                  key={pin.id}
                  onMouseEnter={() => setHoveredPinId(pin.id)}
                  onMouseLeave={() => setHoveredPinId(null)}
                  className="relative break-inside-avoid mb-4 rounded-[20px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition duration-200"
                >
                  {/* Pin Image (Fills container tight, 0 extra padding) */}
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                    className="w-full h-auto block object-cover rounded-[20px] transform group-hover:brightness-90 transition duration-200"
                    loading="lazy"
                  />

                  {/* Pinterest Hover Overlay Elements */}
                  {isHovered && (
                    <div className="absolute inset-0 p-3.5 flex flex-col justify-between z-10 bg-black/25 rounded-[20px] transition duration-200">
                      {/* Top Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => handleSavePin(pin.id, e)}
                          className={`px-4 py-2.5 rounded-full font-bold text-[14px] shadow-lg transition active:scale-95 ${
                            pin.saved
                              ? 'bg-zinc-900 text-white'
                              : 'bg-[#E60023] hover:bg-[#ad081b] text-white'
                          }`}
                        >
                          {pin.saved ? 'Saved' : 'Save'}
                        </button>
                      </div>

                      {/* Bottom Action Icons */}
                      <div className="flex items-center justify-between">
                        <div />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md transition active:scale-90"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md transition active:scale-90"
                            title="More options"
                          >
                            <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
