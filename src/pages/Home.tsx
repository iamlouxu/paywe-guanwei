import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">
                {/* Header Section */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
                    <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight flex-1 text-center">
                        PayWe 管委
                    </h2>
                    <div className="flex w-12 items-center justify-end">
                        <Link
                            to="/login"
                            className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-primary/20 text-slate-900 dark:text-slate-100 hover:bg-primary/30 transition-colors"
                        >
                            <span className="material-symbols-outlined">person</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col gap-6 p-4 pb-24">
                    {/* Quick Action / Summary Section */}
                    <div className="rounded-xl bg-primary p-6 text-slate-900 shadow-lg flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium opacity-80">本月待收款項</p>
                            <p className="text-3xl font-bold">$12,850</p>
                        </div>
                        <Link
                            to="/create-group"
                            className="bg-slate-900 text-white rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-md hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm block">add</span>
                            建立群組
                        </Link>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">進行中的群組</h3>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">3 個活躍中</span>
                    </div>

                    {/* Group Cards */}
                    <div className="flex flex-col gap-4">
                        {[
                            { name: '宜蘭三天兩夜旅行', date: '2023/10/24', people: 4, amount: '$4,500' },
                            { name: '週五麻辣火鍋聚餐', date: '2023/11/03', people: 6, amount: '$2,180' },
                            { name: 'Costco 生活用品採購', date: '2023/11/10', people: 2, amount: '$6,170' },
                        ].map((group) => (
                            <Link
                                key={group.name}
                                to="/expense-record"
                                className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow block text-left"
                            >
                                <div className="flex gap-4">
                                    <div className="flex flex-1 flex-col justify-center">
                                        <p className="text-base font-bold text-center">{group.name}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                            {group.date} • {group.people} 人參與
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                                    <div className="flex flex-col">
                                        <p className="text-xs text-slate-400">群組總花費</p>
                                        <p className="text-lg font-bold text-primary">{group.amount}</p>
                                    </div>
                                    <button className="flex items-center justify-center rounded-full h-10 px-6 bg-primary text-slate-900 text-sm font-bold gap-1">
                                        <span>查看詳情</span>
                                        <span className="material-symbols-outlined text-lg block">chevron_right</span>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50">
                    <Link to="/" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
                        <span className="text-[10px] font-bold">首頁</span>
                    </Link>
                    <Link to="/my-groups" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">group</span>
                        <span className="text-[10px] font-bold">群組</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                        <span className="text-[10px] font-bold">設定</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default Home;
