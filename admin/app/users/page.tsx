import supabaseAdmin from '../../lib/supabase';
import { UsersTable } from '../../components/UsersTable';
import type { UserListItem } from '../../lib/types';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const [authResult, profilesResult] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin.from('user_profile').select('*'),
  ]);

  if (authResult.error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Failed to load users: {authResult.error.message}</p>
      </div>
    );
  }

  const profiles = profilesResult.data ?? [];
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const users: UserListItem[] = authResult.data.users.map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? '',
      created_at: u.created_at,
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      last_activity: profile?.last_activity ?? null,
    };
  });

  return <UsersTable users={users} />;
}
