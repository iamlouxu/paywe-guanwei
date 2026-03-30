import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Profile } from '../types';

export const useGroupMembers = (groupId: string | undefined) => {
    const [members, setMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchMembers = async () => {
            setLoading(true);
            try {
                const { data: groupMembers, error: groupError } = await supabase
                    .from('group_members')
                    .select('user_id')
                    .eq('group_id', groupId);

                if (groupError) throw groupError;

                if (groupMembers && groupMembers.length > 0) {
                    const userIds = groupMembers.map((m) => m.user_id);
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, username, avatar_url, updated_at')
                        .in('id', userIds);

                    if (profileError) throw profileError;

                    if (profiles) {
                        const mappedMembers: Profile[] = profiles.map(p => ({
                            id: p.id,
                            username: p.username,
                            avatar_url: p.avatar_url,
                            updated_at: p.updated_at
                        }));
                        setMembers(mappedMembers);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching group members:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [groupId]);

    return { members, loading, error };
};
