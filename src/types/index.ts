export type Profile = {
    id: string;
    username: string | null;
    avatar_url: string | null;
    updated_at?: string;
};

export type GroupData = {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
    is_settled: boolean;
};

export type Expense = {
    id: string;
    group_id: string;
    paid_by: string;
    amount: number;
    description: string;
    created_at: string;
    payer_name?: string; // UI enrichment
};

export type MemberBalance = {
    id: string;
    username: string;
    avatar_url: string;
    balance: number;
};

export type Transaction = {
    from: MemberBalance;
    to: MemberBalance;
    amount: number;
};
