export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 60) return '剛剛';
    if (diffHours < 24 && now.getDate() === date.getDate()) return '今天';
    if (diffDays === 1 || (diffHours < 48 && now.getDate() !== date.getDate())) return '昨天';
    return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
