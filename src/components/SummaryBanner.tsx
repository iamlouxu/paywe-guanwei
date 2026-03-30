import React from 'react';
import { formatCurrency } from '../utils/formatters';

type SummaryBannerProps = {
    title: string;
    amount: number;
    statusContent?: React.ReactNode;
    variant?: 'primary' | 'amber';
    className?: string;
};

const SummaryBanner: React.FC<SummaryBannerProps> = ({
    title,
    amount,
    statusContent,
    variant = 'primary',
    className = ''
}) => {
    const bgClass = variant === 'primary' ? 'bg-primary/10 border-primary/20' : 'bg-amber-500/10 border-amber-500/20';
    
    return (
        <div className={`px-6 py-6 flex flex-col items-center justify-center ${bgClass} mx-6 rounded-3xl mt-4 mb-8 shadow-sm border ${className}`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">${formatCurrency(amount)}</h1>
            {statusContent}
        </div>
    );
};

export default SummaryBanner;
