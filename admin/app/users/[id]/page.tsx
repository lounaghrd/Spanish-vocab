import supabaseAdmin from '../../../lib/supabase';
import { UserDetailPanel } from '../../../components/UserDetailPanel';
import type { UserDetail, UserWordWithDetails } from '../../../lib/types';

export const dynamic = 'force-dynamic';

async function fetchUserWords(userId: string): Promise<UserWordWithDetails[]> {
  const PAGE = 1000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('user_word')
      .select('*, word:word_id(spanish_word, english_translation)')
      .eq('user_id', userId)
      .order('next_review_at', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (data) all.push(...data);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return all.map((uw: any) => ({
    id: uw.id,
    word_id: uw.word_id,
    user_id: uw.user_id,
    level: uw.level,
    last_reviewed_at: uw.last_reviewed_at,
    next_review_at: uw.next_review_at,
    suspended: uw.suspended,
    marked_as_learned: uw.marked_as_learned,
    successful_guesses: uw.successful_guesses,
    failed_guesses: uw.failed_guesses,
    created_at: uw.created_at,
    updated_at: uw.updated_at,
    spanish_word: uw.word?.spanish_word ?? '(deleted word)',
    english_translation: uw.word?.english_translation ?? '',
  }));
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [authResult, profileResult] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(id),
    supabaseAdmin.from('user_profile').select('*').eq('id', id).maybeSingle(),
  ]);

  if (authResult.error || !authResult.data?.user) {
    return (
      <div className="p-8">
        <p className="text-red-600">User not found.</p>
      </div>
    );
  }

  const authUser = authResult.data.user;
  const profile = profileResult.data;

  const user: UserDetail = {
    id: authUser.id,
    email: authUser.email ?? '',
    created_at: authUser.created_at,
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    last_activity: profile?.last_activity ?? null,
  };

  let userWords: UserWordWithDetails[] = [];
  let wordsError: string | null = null;
  try {
    userWords = await fetchUserWords(id);
  } catch (e) {
    wordsError = e instanceof Error ? e.message : 'Failed to load user words.';
  }

  return <UserDetailPanel user={user} userWords={userWords} wordsError={wordsError} />;
}
