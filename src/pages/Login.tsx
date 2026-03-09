import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex justify-center">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col min-h-screen">
                {/* Header / Mascot Section */}
                <div className="relative pt-12 pb-8 flex flex-col items-center bg-gradient-to-b from-primary/10 to-transparent flex-shrink-0">
                    <div className="w-40 h-40 mascot-bounce mb-6 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-inner overflow-hidden">
                        <img
                            alt="PayWe Logo"
                            className="object-contain w-full h-full"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt0X34-WXYJK5tQmTOb9pZ1Ue2UTZOPGXQbu1Aj5OJusud91hkm-HV3C31YLcoYxqjNY0uh_qQ5Sp-T4RXj5VgTjhTlPwOVQrB2jPaKv8Y5J4XOYz-SL84pr-kciL4sXl-NZpsiaq2Ud8feR4dkHwaOY529l-toSKOAUDkLqjo3i4T2RCUtxbklJ2DtZch3YgSWoxF3mo7gExFuFcvo_2b44LK2JO2qFxqSjzv4W9j5qs5IZsNbakYmdrYJNNlKtPVjfaQDrL-EQ"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">歡迎來到 PayWe 管委</h1>
                    <p className="text-slate-500 dark:text-slate-400">開始你的輕鬆算帳之旅</p>
                </div>

                {/* Tab Selection */}
                <div className="px-8 mb-8 flex-shrink-0">
                    <div className="flex p-1 bg-background-light dark:bg-slate-800 rounded-full relative">
                        {/* Slide Animation Background */}
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 shadow-sm ${isLogin ? 'left-1' : 'left-[calc(50%+2px)]'
                                }`}
                        ></div>
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-[1_0_0%] py-3 px-6 rounded-full font-bold transition-colors relative z-10 cursor-pointer ${isLogin ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            登入
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-[1_0_0%] py-3 px-6 rounded-full font-bold transition-colors relative z-10 cursor-pointer ${!isLogin ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            註冊
                        </button>
                    </div>
                </div>

                {/* Sliding Forms Container */}
                <div className="overflow-hidden pb-12 w-full flex-1">
                    <div
                        className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-[200%]"
                        style={{ transform: `translateX(${isLogin ? '0%' : '-50%'})` }}
                    >
                        {/* Login Form */}
                        <div className="w-1/2 flex-shrink-0 px-8 space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-4 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="帳號"
                                        type="email"
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-12 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="密碼"
                                        type="password"
                                    />
                                    <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        className="rounded text-primary focus:ring-primary bg-background-light dark:bg-slate-800 border-transparent cursor-pointer"
                                        type="checkbox"
                                    />
                                    <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700">記住我</span>
                                </label>
                            </div>
                            <Link
                                to="/"
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 block text-center mt-2 group"
                            >
                                <span>登入帳號</span>
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Registration Form */}
                        <div className="w-1/2 flex-shrink-0 px-8 space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-4 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="帳號"
                                        type="email"
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-12 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="密碼"
                                        type="password"
                                    />
                                    <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock_reset</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-12 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="確認密碼"
                                        type="password"
                                    />
                                    <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                            </div>
                            <Link
                                to="/"
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 block text-center mt-2 group cursor-pointer"
                            >
                                <span>註冊帳號</span>
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
