import React from 'react';
import { Link } from 'react-router-dom';

// This page represents the "群組帳務明細" screen from the new design
const ExpenseRecord: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">
                {/* Top App Bar */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
                    <Link
                        to="/"
                        className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </Link>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">PayWe 管委</span>
                        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
                            群組帳務明細
                        </h2>
                    </div>
                    <div className="flex w-12 items-center justify-end cursor-pointer">
                        <span className="material-symbols-outlined text-2xl text-slate-900 dark:text-slate-100">more_horiz</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-32">
                    {/* Summary Banner */}
                    <div className="px-6 py-6 flex flex-col items-center justify-center bg-primary/10 mx-6 rounded-3xl mt-4 mb-8 shadow-sm border border-primary/20">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">群組總消費</p>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">$3,450</h1>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="size-2 rounded-full bg-primary"></div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">你需收款 <span className="text-primary">$225</span></p>
                        </div>
                    </div>

                    {/* Expense List */}
                    <div className="px-6">
                        <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight pb-4">帳務紀錄</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { name: '正餐', payer: '你支付', time: '剛剛', amount: '$450' },
                                { name: '飲品', payer: '陳小明支付', time: '昨天', amount: '$240' },
                                { name: '生活用品', payer: '林美惠支付', time: '10月12日', amount: '$850' },
                                { name: '交通費', payer: '王大同支付', time: '10月10日', amount: '$1,910' },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                                >
                                    <div className="flex flex-col">
                                        <p className="text-base font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                                        <p className="text-xs font-medium text-slate-500">{item.payer} • {item.time}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-base font-bold text-slate-900 dark:text-slate-100">{item.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10 max-w-md mx-auto w-full">
                    <div className="flex gap-3 pointer-events-auto items-center">
                        <button className="flex-1 bg-primary text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
                            已結清
                        </button>
                        <Link
                            to="/add-expense"
                            className="size-14 bg-primary text-slate-900 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-3xl font-bold">add</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseRecord;
