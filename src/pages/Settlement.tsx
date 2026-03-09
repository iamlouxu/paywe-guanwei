import React from 'react';
import { Link } from 'react-router-dom';

const Settlement: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-center max-w-md mx-auto shadow-2xl relative">
            <div className="absolute inset-0 flex flex-col h-full w-full">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                    <div className="flex items-center p-4 justify-between">
                        <Link
                            to="/"
                            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">
                                arrow_back
                            </span>
                        </Link>
                        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                            結算與餘額狀態
                        </h1>
                        <div className="flex w-10 items-center justify-end">
                            <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">
                                    history
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pb-24">
                    {/* Mascot Summary Card */}
                    <div className="p-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 border border-primary/20">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                        誰要給誰多少錢
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        目前整體的收支平衡摘要，所有帳務一目了然。
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-semibold text-primary">
                                            已更新至今日
                                        </span>
                                    </div>
                                </div>
                                <div className="relative size-24 shrink-0 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
                                    {/* Mascot Placeholder Illustration */}
                                    <div
                                        className="relative z-10 w-full h-full bg-contain bg-center bg-no-repeat"
                                        data-alt="A cute friendly mascot holding a calculator and a coin"
                                        style={{
                                            backgroundImage:
                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBn2MeE0VTM4kDXhLhi1qOKMqxb3xLiDYV7wV9m8jGm4KMrdZqlAj9LCRYTAmoYMZG21Lhea74XZzyC_8dzjYSvX8clzg2skkYeKQr_iDJTC3P_fppPUUqGm0WOjhT_c5D5pW0wV3eZ6XfE76jaA4w573zjU8ZZSzyR4mn8vaz1JciLhQ_JTre5MTWqEp1IJouXMVvcSloTBT2j4NH3R-5QTJ5K43oMb09DaoNcUHbPTZG7vax1ORrnOYi7EmuhmG2TtjiGFf_XXw")',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Tabs */}
                    <div className="px-4">
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button className="flex-1 flex flex-col items-center justify-center border-b-4 border-primary text-slate-900 dark:text-slate-100 pb-3 pt-2 transition-all">
                                <span className="text-sm font-bold">待付款</span>
                                <span className="text-xs text-red-500 font-medium">-$2,450</span>
                            </button>
                            <button className="flex-1 flex flex-col items-center justify-center border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-3 pt-2 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold">待收款</span>
                                <span className="text-xs text-primary font-medium">+$1,800</span>
                            </button>
                        </div>
                    </div>

                    {/* Settlement List Section */}
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold leading-tight">結算清單</h2>
                            <button className="text-primary text-sm font-semibold flex items-center gap-1">
                                查看報表{' '}
                                <span className="material-symbols-outlined text-sm">
                                    chevron_right
                                </span>
                            </button>
                        </div>
                        {/* List Items */}
                        <div className="space-y-3">
                            {/* Person Item: Owed (Green) */}
                            <div className="flex items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="size-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">
                                        person
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">王大明 (主辦人)</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        上次更新: 2小時前
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary font-bold text-lg">+$1,200</p>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-primary/70">
                                        應收款
                                    </p>
                                </div>
                            </div>
                            {/* Person Item: Owing (Red) */}
                            <div className="flex items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="size-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-500">
                                        person
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">李小華</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        上次更新: 昨天
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-500 font-bold text-lg">-$850</p>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-red-500/70">
                                        應付款
                                    </p>
                                </div>
                            </div>
                            {/* Person Item: Balanced */}
                            <div className="flex items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm opacity-80">
                                <div className="size-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-400">
                                        person
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate text-slate-500">張三</p>
                                    <p className="text-xs text-slate-400">已結清</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 font-bold text-lg">$0</p>
                                    <span className="material-symbols-outlined text-primary text-sm">
                                        check_circle
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Action */}
                    <div className="p-4">
                        <button className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">payments</span>
                            發起一鍵結算
                        </button>
                    </div>
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] mx-auto max-w-md w-full">
                    <div className="flex items-center justify-around h-16 w-full">
                        <Link
                            to="/"
                            className="flex flex-col items-center gap-1 text-slate-400"
                        >
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-[10px] font-medium">首頁</span>
                        </Link>
                        <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="text-[10px] font-medium">帳單</span>
                        </a>
                        <Link
                            to="/settlement"
                            className="flex flex-col items-center gap-1 text-primary"
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                account_balance_wallet
                            </span>
                            <span className="text-[10px] font-bold">結算</span>
                        </Link>
                        <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-[10px] font-medium">設定</span>
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Settlement;
