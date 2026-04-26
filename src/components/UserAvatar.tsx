import React, { useState } from 'react';

type UserAvatarProps = {
  src?: string | null;
  username?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xl2' | '2xl';
  className?: string;
};

const UserAvatar: React.FC<UserAvatarProps> = ({ src, username, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  // 這裡使用一個穩定且美觀的 UI Avatars 服務作為 fallback
  // 它會根據用戶名稱生成縮寫頭像，比純 icon 更具辨識度
  const initials = username ? encodeURIComponent(username.charAt(0)) : 'P';
  const fallbackUrl = `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&bold=true`;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-xl',
    xl2: 'w-28 h-28 text-2xl',
    '2xl': 'w-32 h-32 text-3xl',
  };

  const currentSizeClass = sizeClasses[size];

  // 如果有傳入 src 且尚未發生載入錯誤，就使用 src，否則用預設頭像
  const displaySrc = (src && !imgError) ? src : fallbackUrl;

  return (
    <div 
      className={`rounded-full border-2 border-slate-100 dark:border-slate-800 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 ${currentSizeClass} ${className}`}
    >
      <img 
        src={displaySrc} 
        alt={username || 'User'} 
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default UserAvatar;
