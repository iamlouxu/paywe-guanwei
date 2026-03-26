import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { path: '/', label: '首頁', icon: 'home' },
        { path: '/my-groups', label: '群組', icon: 'group' },
        { path: '/settings', label: '設定', icon: 'settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800/50 px-8 py-3 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = currentPath === item.path;
                
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="relative flex flex-col items-center justify-center py-1 px-4 group"
                    >
                        {/* Active Indicator Bar handled below */}

                        <motion.div
                            animate={{ 
                                y: isActive ? -2 : 0,
                                scale: isActive ? 1.1 : 1
                            }}
                            className={`flex flex-col items-center gap-0.5 relative z-10 ${
                                isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                            }`}
                        >
                            <span 
                                className="material-symbols-outlined text-[24px] transition-all"
                                style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}
                            >
                                {item.icon}
                            </span>
                            <span className={`text-[10px] font-bold tracking-tight transition-all ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                                {item.label}
                            </span>
                        </motion.div>

                        {/* Soft Glow Indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="nav-glow"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ 
                                    opacity: { repeat: Infinity, duration: 3 },
                                    layout: { type: "spring", stiffness: 300, damping: 30 }
                                }}
                                className="absolute inset-0 bg-primary/25 dark:bg-primary/40 rounded-full blur-2xl z-0"
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;
