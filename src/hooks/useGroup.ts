import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { GroupData } from '../types';

export const useGroup = (groupId: string | undefined) => {
    const [group, setGroup] = useState<GroupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchGroup = async () => {
            setLoading(true);
            try {
                const { data, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();

                if (groupError) throw groupError;
                setGroup(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [groupId]);

    const setGroupSettled = (isSettled: boolean) => {
        if (group) {
            setGroup({ ...group, is_settled: isSettled });
        }
    };

    return { group, loading, error, setGroupSettled };
};
