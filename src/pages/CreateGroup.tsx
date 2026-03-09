import React from 'react';
import { Link } from 'react-router-dom';

const CreateGroup: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-md mx-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center p-4 pb-2 justify-between">
                    <Link
                        to="/"
                        className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
                        建立新群組
                    </h2>
                </div>

                {/* Group Photo */}
                <div className="flex p-4">
                    <div className="flex w-full flex-col gap-4 items-center">
                        <div className="flex gap-4 flex-col items-center">
                            <div className="relative">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-primary/20 shadow-lg"
                                    style={{
                                        backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAgx4nbvrfrRsEoqxkSxpQ-SR-6ybO4wQ9OoZZIltzlZv7akI3Fe6KjKFmvxxSAN5HH_a091sw03spCtGvNjelocDwufHUpseO4GiB2yV2N1ij42rbByqDDW0MqogCTgxB5ivtKC_QkbMtU3vZa3CCB8yTKhrEIUTt5NVDbw5W9Hie-Mpv9uzL7rhoh5w7_7DSBJ2uk7I7_yaHWC5lXelcbbR10rSAeVRU0UafFPWcFdaW4XGFEWpG-9cmg67KJiXZZHuFGwodukQ")',
                                    }}
                                ></div>
                                <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-background-light shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
                                    <span className="material-symbols-outlined text-background-dark text-sm block">photo_camera</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-slate-900 dark:text-slate-100 text-[22px] font-bold leading-tight tracking-tight text-center">設定群組照片</p>
                                <p className="text-primary font-medium text-base leading-normal text-center cursor-pointer hover:underline">點擊更換</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Group Name Input */}
                <div className="flex flex-col gap-4 px-4 py-3">
                    <label className="flex flex-col w-full">
                        <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">群組名稱</p>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-primary/20 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 p-[15px] font-display text-base font-normal leading-normal transition-all"
                            placeholder="輸入群組名稱 (例如: PayWe 管委會)..."
                        />
                    </label>
                </div>

                {/* Invite Members */}
                <div className="px-4 pb-2 pt-6">
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">邀請成員</h3>
                </div>

                <div className="px-4 py-3">
                    <label className="flex flex-col min-w-40 h-12 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                            <div className="text-primary flex border-none bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-white dark:bg-slate-800 h-full placeholder:text-slate-400 px-4 pl-2 font-display text-base font-normal leading-normal"
                                placeholder="搜尋姓名或帳號 (可搜尋全平台用戶)"
                            />
                        </div>
                    </label>
                </div>

                {/* Friends List */}
                <div className="px-4 flex flex-col gap-3">
                    {/* Friend 1 */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-primary/30"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWagVgcil5zGQ-yjy_a2tMf3uD6UGYLCEFaFte0RJKXnPcYBoXEuzu8wzqq8VwhCifI8TyDPhhb8tGxG2dVAeJ423nYJn-Ij2auK6Wydd0NwEPBv5XMMMMl9mE34aVymJJC58QZHr8dUtRZ7knrsTDMh3SZgDMfh47PyERhBsmVfEHbfxYelpOvLiGp3DlvAOavbHmWyFYMAh6nFFc6zhtF1LJ2beXsgtovV1UE-sD32mCgLZKRJAl9YF_A2UnUA508OU6mT68LQ')" }}
                            ></div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">陳小明</p>
                                <p className="text-xs text-slate-500">ID: ming_123</p>
                            </div>
                        </div>
                        <button className="bg-primary/20 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full font-bold text-sm hover:bg-primary transition-colors cursor-pointer">加入</button>
                    </div>

                    {/* Friend 2 - already added */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-primary/30"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDy9_x-LGaGTXRhCtmYoVXM6iCW-tCsOn0u7PcnqBh1X31_5kTIZ0ey1lhrZorAtcUwLOzIm2BDTQXX8zmCPlLGKlfq7s9IdquSHSJ3K4uxmP_FpvtbQaXBJCKmrO5IQY00EDpZc0nImKaPQDAOLEnSaZ60Yd0MxzL_yHR86DSTyztQ6To7wa3hs_9f_Ruw2D6-peRm4YLebKTmEVLj54APK_lLz349cyclrxXm-CZ7dpUxSxscv2hgw2EMohy0COGneDh0zQTD8Q')" }}
                            ></div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">李佳玲</p>
                                <p className="text-xs text-slate-500">ID: jia_ling</p>
                            </div>
                        </div>
                        <button className="bg-primary text-background-dark px-4 py-2 rounded-full font-bold text-sm shadow-sm cursor-pointer opacity-80">已加入</button>
                    </div>

                    {/* Friend 3 */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-primary/30"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJFpq_XFHoKcSWnt7JGWh3VCCfzrjsd5S0IQyP0viC0nqjbz8YY6R28wM1MEOZ5GAXSSWaGVhQUJVALMQgT64Qscyh7RgEEvClVTWcOZ0-6cgQaFoT48vrIQor1YoIh_Z5ipfzQbDU1gti4FBDfHxswS5YnPXcDDJnFC9_Gt0VIT5pvpWGyY_nsFjzpoegWgsaWXyDksyuyo0fU_vbwTq8U_mcLBs9CMY0P2I1qTgDuKd9Pr1zAavVx7OjGfAh-uBI-0z3t_vZng')" }}
                            ></div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">張大衛</p>
                                <p className="text-xs text-slate-500">ID: david_z</p>
                            </div>
                        </div>
                        <button className="bg-primary/20 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full font-bold text-sm hover:bg-primary transition-colors cursor-pointer">加入</button>
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-auto p-4">
                    <Link
                        to="/"
                        className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all relative"
                    >
                        <span>完成建立</span>
                        <span className="material-symbols-outlined">check_circle</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
