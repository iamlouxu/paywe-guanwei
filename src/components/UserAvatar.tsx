import React from 'react';

interface UserAvatarProps {
  src?: string | null;
  username?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, username, size = 'md', className = '' }) => {
  // 這裡使用一個穩定且美觀的 UI Avatars 服務作為 fallback
  // 它會根據用戶名稱生成縮寫頭像，比純 icon 更具辨識度
  const initials = username ? encodeURIComponent(username.charAt(0)) : 'P';
  const fallbackUrl = `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&bold=true`;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-32 h-32 text-3xl',
  };

  const currentSizeClass = sizeClasses[size];

  return (
    <div 
      className={`rounded-full bg-cover bg-center border-2 border-slate-100 dark:border-slate-800 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden ${currentSizeClass} ${className}`}
      style={src ? { backgroundImage: `url('${src}')` } : {}}
    >
      {!src && (
        <img 
          src={fallbackUrl} 
          alt={username || 'User'} 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default UserAvatar;
