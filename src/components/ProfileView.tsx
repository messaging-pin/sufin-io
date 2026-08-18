import React, { useState, useEffect } from 'react';
import { Edit3, Check, Camera, LogOut, Loader2, Info, Heart, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { uploadChatAttachment } from '../lib/supabase';

export const ProfileView: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth();

  const getInitialName = () => profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Ai sam';

  const [displayName, setDisplayName] = useState(getInitialName());
  const [bio, setBio] = useState(
    profile?.bio || 'Building the future of messaging ✨ | Pinterest Direct 🚀'
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      if (profile.display_name) setDisplayName(profile.display_name);
      if (profile.bio) setBio(profile.bio);
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
    } else if (user) {
      const meta = user.user_metadata || {};
      const name = meta.full_name || meta.name || 'Ai sam';
      setDisplayName(name);
      if (meta.avatar_url || meta.picture) setAvatarUrl(meta.avatar_url || meta.picture);
    }
  }, [profile, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);

      const uploadedUrl = await uploadChatAttachment(file);
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        await updateProfile({
          display_name: displayName,
          bio,
          avatar_url: uploadedUrl
        });
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;

    setIsSaving(true);
    const cleanDisplayName = displayName.trim();
    setDisplayName(cleanDisplayName);

    await updateProfile({
      display_name: cleanDisplayName,
      bio: bio.trim(),
      avatar_url: avatarUrl
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent text-white overflow-y-auto no-scrollbar select-none font-sans p-6 items-center justify-center relative">
      <div className="w-full max-w-[320px] flex flex-col items-center text-center space-y-4 glass-modal rounded-[32px] p-6 shadow-2xl">
        {/* Profile Picture with Liquid Glass Rim */}
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <UserAvatar
            name={displayName}
            src={avatarUrl}
            size="xl"
            className="w-24 h-24 shadow-lg"
          />
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition text-white">
            <Camera className="w-6 h-6" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Name & Bio */}
        {isEditing ? (
          <div className="w-full space-y-3 text-left pt-1">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#0095F6]"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a bio..."
                rows={3}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0095F6] resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving || !displayName.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#0095F6] to-[#0077D6] hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {saveSuccess && (
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl animate-fadeIn">
                ✓ Profile saved to database!
              </div>
            )}

            <div className="py-1">
              <h3 className="text-[20px] font-bold text-white tracking-tight">{displayName}</h3>
            </div>

            <p className="text-[13px] text-zinc-300 leading-relaxed px-2 font-normal">
              {bio}
            </p>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-[13px] font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => signOut()}
                className="w-full py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 text-[12px] font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Information Button & Tribute Card */}
      <div className="absolute bottom-4 right-4 z-30">
        {/* Info Popover Card */}
        {showInfo && (
          <div
            className="absolute bottom-11 right-0 w-64 glass-modal rounded-2xl p-3.5 shadow-2xl border border-white/20 animate-scaleUp text-left backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between space-x-2 pb-1.5 border-b border-white/10">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <Heart className="w-3.5 h-3.5 text-[#E60023] fill-[#E60023] animate-pulse" />
                <span>Special Note</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[12.5px] text-zinc-100 font-medium leading-relaxed mt-2 select-text">
              "Built by Finny for his fav closest person"
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shadow-lg ${
            showInfo
              ? 'bg-[#0095F6] text-white border-blue-400'
              : 'bg-white/[0.08] hover:bg-white/[0.18] text-zinc-400 hover:text-white border-white/10'
          }`}
          title="App Information"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
