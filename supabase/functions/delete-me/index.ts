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
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization')!;
  const token = authHeader.replace('Bearer ', '');
  const { data, error: authError } = await supabase.auth.getUser(token);
  const user = data.user;

  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // Terminate all active sessions for the user
  const { error: signoutError } = await supabase.auth.admin.signOut(token, 'global');
  if (signoutError) {
    return jsonResponse({ error: 'Failed to terminate sessions' }, 500);
  }

  // Delete user-related storage objects if any
  const { error: storageError } = await supabase.storage
    .from('avatars')
    .remove([`public/${user.id}.jpg`]);

  if (storageError) {
    return jsonResponse({ error: 'Failed to delete storage objects' }, 500);
  }

  // Delete the user
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return jsonResponse({ error: 'Failed to delete user' }, 500);
  }

  return jsonResponse({ message: 'You have been deleted' }, 200);
});
