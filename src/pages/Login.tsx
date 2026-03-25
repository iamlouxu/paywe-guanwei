import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    // Form state
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleLogin = async () => {
        setError('');
        setSuccessMsg('');
        if (!email || !password) {
            setError('請填寫信箱和密碼');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            setError('信箱或密碼不正確');
        } else {
            toast.success('登入成功');
            navigate('/');
        }
    };

    const handleSignUp = async () => {
        setError('');
        setSuccessMsg('');
        if (!email || !username || !password || !confirmPassword) {
            setError('請填寫所有欄位');
            return;
        }
        if (username.trim().length < 2) {
            setError('名稱至少需要 2 個字元');
            return;
        }
        if (password !== confirmPassword) {
            setError('兩次密碼不一致');
            return;
        }
        if (password.length < 6) {
            setError('密碼至少需要 6 個字元');
            return;
        }
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username: username.trim() }
            }
        });
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            if (data.session) {
                // 如果 Supabase 後台關閉了信箱驗證，就會直接核發 session，我們就直接跳轉首頁
                navigate('/');
            } else {
                // 如果沒關閉，還是得提示要收信
                setSuccessMsg('註冊成功！但系統設定需要信箱驗證，請收信後登入。（若要直接登入，請去 Supabase 後台關閉 Confirm Email）');
                setIsLogin(true);
            }
        }
    };

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
                            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
                            className={`flex-[1_0_0%] py-3 px-6 rounded-full font-bold transition-colors relative z-10 cursor-pointer ${isLogin ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            登入
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
                            className={`flex-[1_0_0%] py-3 px-6 rounded-full font-bold transition-colors relative z-10 cursor-pointer ${!isLogin ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            註冊
                        </button>
                    </div>
                </div>

                {/* Error / Success Message */}
                {error && (
                    <div className="mx-8 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center flex-shrink-0">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mx-8 mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm text-center flex-shrink-0">
                        {successMsg}
                    </div>
                )}

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
                                        placeholder="信箱"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-12 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="密碼"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
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
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                ) : (
                                    <>
                                        <span>登入帳號</span>
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </>
                                )}
                            </button>
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
                                        placeholder="信箱"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-4 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="名稱"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-12 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="密碼"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock_reset</span>
                                    </div>
                                    <input
                                        className="block w-full pl-12 pr-12 py-4 bg-background-light dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all font-display"
                                        placeholder="確認密碼"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleSignUp}
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                ) : (
                                    <>
                                        <span>註冊帳號</span>
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
