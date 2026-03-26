import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingState: React.FC = () => {
    const [progress, setProgress] = useState(0);

    // 模擬載入進度
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev;
                // 越靠近 100 跑越慢，營造高級感
                const diff = (100 - prev) * 0.1;
                return Math.min(prev + diff, 98);
            });
        }, 150);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center font-display overflow-hidden relative p-8">
            
            {/* Subtle glow background */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary rounded-full blur-[120px]"
                />
            </div>

            <div className="w-full max-w-[280px] space-y-8 relative z-10">
                {/* Text section */}
                <div className="text-center">
                    <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2"
                    >
                        等一下齁...
                    </motion.h3>
                    <div className="flex justify-center items-baseline gap-1 h-6">
                        <motion.p 
                            className="text-primary font-black text-lg"
                        >
                            {Math.floor(progress)}
                        </motion.p>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">%</span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50 p-1">
                    {/* Animated fill */}
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", damping: 15, stiffness: 50 }}
                        className="h-full bg-primary rounded-full relative shadow-[0_0_15px_rgba(255,214,0,0.5)]"
                    >
                        {/* High-end glossy effect */}
                        <div className="absolute inset-x-0 top-0 h-[40%] bg-white/30 rounded-full" />
                        
                        {/* Flowing light effect */}
                        <motion.div 
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[30deg]"
                        />
                    </motion.div>
                </div>

                {/* Subtext tips */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >
                    正在整理帳務數據
                </motion.p>
            </div>
        </div>
    );
};

export default LoadingState;
