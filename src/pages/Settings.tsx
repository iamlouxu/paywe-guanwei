import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import ConfirmBottomSheet from '../components/ConfirmBottomSheet';
import BottomNav from '../components/BottomNav';
import UserAvatar from '../components/UserAvatar';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [savingName, setSavingName] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
                // 抓取 profiles 表的資料
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (userProfile) {
                    setUsername(userProfile.username || '尚未設定名稱');
                    setTempName(userProfile.username || '');
                    setAvatarUrl(userProfile.avatar_url || '');
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
            toast.success('頭像更新成功');

        } catch (error) {
            console.error('上傳頭像失敗:', error);
            toast.error('上傳失敗，請確認是否建立了 avatars storage bucket');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveName = async () => {
        if (!tempName.trim()) {
            toast.error('名稱不能為空');
            return;
        }
        if (tempName === username) {
            setIsEditingName(false);
            return;
        }

        try {
            setSavingName(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { error } = await supabase
                .from('profiles')
                .update({ username: tempName.trim() })
                .eq('id', user.id);

            if (error) throw error;

            setUsername(tempName.trim());
            toast.success('名稱已更新');
            setIsEditingName(false);
        } catch (error) {
            console.error('更新名稱失敗:', error);
            toast.error('更新名稱失敗，請稍後再試');
        } finally {
            setSavingName(false);
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
                        <p className="text-sm font-bold text-primary tracking-widest">PayWe 管委</p>
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
                                        <div className="relative group transition-transform hover:scale-105">
                                            <UserAvatar src={avatarUrl} username={username} size="xl2" className="border-4 border-white dark:border-slate-800 shadow-xl" />
                                            <div className="absolute bottom-0.5 right-0.5 bg-primary p-1.5 rounded-full border-2 border-white dark:border-slate-950 shadow-lg flex items-center justify-center">
                                                {uploading ? (
                                                    <span className="material-symbols-outlined text-slate-900 text-[14px] animate-spin block">progress_activity</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-900 text-[16px] block">photo_camera</span>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={uploadAvatar}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </div>
                                <div className="text-center mt-2 w-full max-w-[260px]">
                                    {isEditingName ? (
                                        <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="輸入新名稱"
                                                autoFocus
                                                className="w-full text-center px-2 py-2 bg-white dark:bg-slate-800 border-2 border-primary/20 focus:border-primary rounded-xl text-lg font-bold text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none transition-colors"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setIsEditingName(false);
                                                        setTempName(username);
                                                    }}
                                                    disabled={savingName}
                                                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                >
                                                    取消
                                                </button>
                                                <button
                                                    onClick={handleSaveName}
                                                    disabled={savingName || !tempName.trim()}
                                                    className="flex-1 py-2 rounded-xl bg-primary text-slate-900 font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                                >
                                                    {savingName ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : '儲存'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            onClick={() => setIsEditingName(true)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{username}</h2>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-[20px]">edit</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 mt-1">{email}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Logout */}
                    <section className="mt-8 flex flex-col gap-4">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span>登出帳號</span>
                        </button>
                    </section>
                </main>

                <BottomNav />
            </div>

            <ConfirmBottomSheet
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                variant="logout"
                title="確定要登出嗎？"
                description="登出後需要重新登入才能繼續使用 PayWe 管委的各項功能。"
                confirmText="是的，我要登出"
                cancelText="取消"
            />
        </div>
    );
};

export default Settings;
