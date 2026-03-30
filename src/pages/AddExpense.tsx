import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import LoadingState from '../components/LoadingState';
import PageLayout from '../components/PageLayout';
import ExpenseForm from '../components/ExpenseForm';
import { useAuth } from '../hooks/useAuth';
import { useGroupMembers } from '../hooks/useGroupMembers';

const AddExpense: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { members, loading: loadingMembers } = useGroupMembers(groupId);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setPaidBy(user.id);
    }, [user]);

    useEffect(() => {
        if (members.length > 0 && selectedMembers.length === 0) {
            setSelectedMembers(members.map(m => m.id));
        }
    }, [members]);

    const handleAddExpense = async () => {
        if (!groupId || !description || !amount || selectedMembers.length === 0) {
            toast.error('請填寫完整資訊');
            return;
        }

        setLoading(true);
        try {
            const numAmount = parseFloat(amount);
            const { data: expenseData, error: expenseError } = await supabase
                .from('expenses')
                .insert([{
                    group_id: groupId,
                    description,
                    amount: numAmount,
                    paid_by: paidBy
                }])
                .select()
                .single();

            if (expenseError) throw expenseError;

            const splitAmount = numAmount / selectedMembers.length;
            const splits = selectedMembers.map(userId => ({
                expense_id: expenseData.id,
                user_id: userId,
                amount: splitAmount
            }));

            const { error: splitError } = await supabase
                .from('expense_splits')
                .insert(splits);

            if (splitError) throw splitError;

            toast.success('已成功新增花費！');
            navigate(`/group/${groupId}`);
        } catch (err: any) {
            toast.error(`新增失敗: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingMembers) return <LoadingState />;

    return (
        <PageLayout>
            <ExpenseForm 
                title="新增花費"
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                paidBy={paidBy}
                setPaidBy={setPaidBy}
                members={members}
                selectedMembers={selectedMembers}
                setSelectedMembers={setSelectedMembers}
                onSubmit={handleAddExpense}
                loading={loading}
                submitText="儲存這筆花費"
                backPath={`/group/${groupId}`}
            />
        </PageLayout>
    );
};

export default AddExpense;
