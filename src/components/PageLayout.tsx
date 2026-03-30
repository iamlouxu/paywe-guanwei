import React from 'react';

type PageLayoutProps = {
    children: React.ReactNode;
    header?: React.ReactNode;
    maxWidth?: string;
    className?: string;
};

const PageLayout: React.FC<PageLayoutProps> = ({ 
    children, 
    header, 
    maxWidth = 'max-w-md',
    className = ''
}) => {
    return (
        <div className={`bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen ${className}`}>
            <div className={`relative flex h-screen w-full flex-col overflow-hidden ${maxWidth} mx-auto shadow-2xl`}>
                {header}
                {children}
            </div>
        </div>
    );
};

export default PageLayout;
