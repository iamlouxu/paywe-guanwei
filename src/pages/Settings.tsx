import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
                
                // 抓取 profiles 表的資料
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setUsername(profile.username || '尚未設定名稱');
                    setAvatarUrl(profile.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHgf4ZSTbfx30JuEq6fJ2cfKn69_NExuDWSHrVAKZ7EfcCI7nCaZYT8Z4D-qLx4kffBNPTHRcbGGVyPoikJyM_eGHNr7cGU0Frs0Er1it8GKhnew55mkFlAH87uinZCMkULcwHYgsOmN6Vqedk6VrBdcNL2DURQUQ5eqJpmUhm2-8reDbQFGohegnlUlyc7M6_fIOhDXlOH6EZMSYKyXpKfHvgekiju09S8yc4AyFLgYlw2ZurR4mUUYB9f2KNIT3oBPvFNEPKwg');
                }
            }
            setLoading(false);
        };

        fetchUserProfile();
    }, []);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) throw new Error('User not logged in');
            
            // 檔案名稱：user_id.副檔名
            const filePath = `${user.id}.${fileExt}`;

            // 1. 上傳圖片到 supabase storage 的 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. 取得公開網址
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            // 3. 更新 profiles.avatar_url
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 4. 更新前端畫面
            setAvatarUrl(publicUrl);
            
        } catch (error) {
            console.error('上傳頭像失敗:', error);
            alert('上傳失敗，請確認是否建立了 avatars storage bucket');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('登出成功');
        navigate('/login');
    };
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
            <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden shadow-2xl">
                {/* Header */}
                <header className="flex items-center p-4 pt-6 justify-between">
                    <Link
                        to="/"
                        className="flex size-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-bold flex-1 text-center pr-10">設定</h1>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col px-6">
                    {/* App Branding */}
                    <div className="mt-4 mb-8 text-center">
                        <p className="text-sm font-medium text-primary uppercase tracking-widest">PayWe 管委</p>
                    </div>

                    {/* Profile Section */}
                    <section className="flex flex-col items-center gap-6 py-8">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                            </div>
                        ) : (
                            <>
                                <div className="relative group cursor-pointer">
                                    <label htmlFor="avatar-upload" className="block relative">
                                        <div className="size-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 flex items-center justify-center transition-opacity group-hover:opacity-80">
                                            {avatarUrl && avatarUrl !== '尚未設定名稱' ? (
                                                <img
                                                    alt="User profile photo"
                                                    className="w-full h-full object-cover"
                                                    src={avatarUrl}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
                                            )}
                                        </div>
                                        {/* Camera Icon Overlay */}
                                        <div className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-4 border-background-light shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center">
                                            {uploading ? (
                                                <span className="material-symbols-outlined text-background-dark text-sm animate-spin block">progress_activity</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-background-dark text-sm block">photo_camera</span>
                                            )}
                                        </div>
                                    </label>
                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={uploadAvatar}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-tight">{username}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">{email}</p>
                                </div>
                            </>
                        )}
                    </section>

                    {/* Logout */}
                    <section className="mt-8 flex flex-col gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span>登出帳號</span>
                        </button>
                    </section>
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50">
                    <Link to="/" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">home</span>
                        <span className="text-[10px] font-bold">首頁</span>
                    </Link>
                    <Link to="/my-groups" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">group</span>
                        <span className="text-[10px] font-bold">群組</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span>
                        <span className="text-[10px] font-bold">設定</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default Settings;
