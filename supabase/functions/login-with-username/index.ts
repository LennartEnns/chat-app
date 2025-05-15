import { getAdminClient } from '../_shared/supabaseAdmin.ts';
import jsonResponse from '../_shared/utils/jsonResponse.ts';
import { corsHeaders } from '../_shared/cors.ts'

const clientOptions =  {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
};
const supabase = getAdminClient(clientOptions);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json();
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid login credentials');
    }

    const email = await getEmail(username);
    if (!email) {
      throw new Error('Invalid login credentials');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    return jsonResponse(data, 200);
  } catch (error) {
    console.log(error)
    return jsonResponse({ error: error.message }, error.status ?? 400);
  }
});

/**
 * Retrieve email by username
 * @param {string} username - The username
 * @returns {Promise<string | undefined>} The email address or undefined if not found.
 */
async function getEmail(username: string): Promise<string | undefined> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .single();

  if (!profile?.user_id) {
    return undefined;
  }

  const { data: user } = await supabase.auth.admin.getUserById(profile.user_id);
  return user.user!.email;
}
