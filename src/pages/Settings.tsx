import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Settings: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
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
                        <div className="relative">
                            <div className="size-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                                <img
                                    alt="User profile photo"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHgf4ZSTbfx30JuEq6fJ2cfKn69_NExuDWSHrVAKZ7EfcCI7nCaZYT8Z4D-qLx4kffBNPTHRcbGGVyPoikJyM_eGHNr7cGU0Frs0Er1it8GKhnew55mkFlAH87uinZCMkULcwHYgsOmN6Vqedk6VrBdcNL2DURQUQ5eqJpmUhm2-8reDbQFGohegnlUlyc7M6_fIOhDXlOH6EZMSYKyXpKfHvgekiju09S8yc4AyFLgYlw2ZurR4mUUYB9f2KNIT3oBPvFNEPKwg"
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight">王大明</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">ming_123@example.com</p>
                        </div>
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
