import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

type ActionMenuProps = {
    children: React.ReactNode;
};

export const ActionMenu: React.FC<ActionMenuProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 transition-all cursor-pointer ${
                    isOpen 
                        ? 'text-primary' 
                        : 'text-slate-400 hover:text-primary'
                }`}
            >
                <MoreVertical size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-1.5 flex flex-col gap-1" onClick={() => setIsOpen(false)}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

type ActionMenuItemProps = {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    variant?: 'default' | 'danger';
};

export const ActionMenuItem: React.FC<ActionMenuItemProps> = ({ onClick, icon, label, variant = 'default' }) => {
    const isDanger = variant === 'danger';
    
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                isDanger 
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
        >
            <span className={isDanger ? 'text-red-500' : 'text-slate-400'}>{icon}</span>
            {label}
        </button>
    );
};
