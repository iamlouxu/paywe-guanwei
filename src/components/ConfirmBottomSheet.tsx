import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, LogOut } from 'lucide-react';

interface ConfirmBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    variant?: 'danger' | 'warning' | 'logout';
}

const ConfirmBottomSheet: React.FC<ConfirmBottomSheetProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = '確認',
    cancelText = '取消',
    loading = false,
    variant = 'danger'
}) => {
    const isDanger = variant === 'danger';
    const isWarning = variant === 'warning';
    const isLogout = variant === 'logout';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    {/* Bottom Sheet */}
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[40px] p-8 pb-10 flex flex-col items-center text-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pointer-events-auto">
                            {/* Drag Indicator */}
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 cursor-grab active:cursor-grabbing"></div>

                            {/* Icon Container */}
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring' }}
                                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 border-white dark:border-slate-800 shadow-sm ${
                                    isDanger ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 
                                    isWarning ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                                    'bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                                }`}
                            >
                                {isDanger && <Trash2 className="size-10" strokeWidth={2.5} />}
                                {isWarning && <AlertTriangle className="size-10" strokeWidth={2.5} />}
                                {isLogout && <LogOut className="size-10" strokeWidth={2.5} />}
                            </motion.div>
                            
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">{title}</h3>
                            <p className="text-base text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium px-4 whitespace-pre-line">
                                {description}
                            </p>
                            
                            <div className="flex w-full flex-col gap-3">
                                <motion.button 
                                    whileTap={{ scale: 0.96 }}
                                    onClick={onConfirm} 
                                    disabled={loading}
                                    className={`w-full py-5 text-white font-black rounded-2xl transition-all shadow-xl flex justify-center items-center active:scale-[0.98] disabled:opacity-60 text-lg cursor-pointer ${
                                        isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                                        isWarning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
                                        'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-slate-900/20'
                                    }`}
                                >
                                    {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : confirmText}
                                </motion.button>
                                <motion.button 
                                    whileTap={{ scale: 0.96 }}
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all active:scale-[0.98] text-lg cursor-pointer"
                                >
                                    {cancelText}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmBottomSheet;
