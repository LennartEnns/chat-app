import { getAdminClient } from '../_shared/supabaseAdmin.ts';

const supabase = getAdminClient();

Deno.serve(async (req) => {
  try {
    const { identifier, password } = await req.json();
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid login credentials');
    }

    const email = await getEmail(identifier);
    if (!email) {
      throw new Error('Invalid login credentials');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    return jsonResponse(data, 200);
  } catch (error) {
    return jsonResponse({ error: error.message }, error.status ?? 400);
  }
});

/**
 * Retrieve email by identifier (email or username).
 * @param {string} identifier - The email or username.
 * @returns {Promise<string | undefined>} The email address or undefined if not found.
 */
async function getEmail(identifier: string): Promise<string | undefined> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', identifier)
    .single();

  if (!profile?.user_id) {
    return undefined;
  }

  const { data: user } = await supabase.auth.admin.getUserById(profile.user_id);
  return user.user!.email;
}

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status
  });
}
