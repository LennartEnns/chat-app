import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import testUsers from "./testUsers";
import { readFileSync } from 'fs';
import path from "path";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});
const pgClient = new Client({
  connectionString: process.env.SUPABASE_DB_URL
});

const seedTestUsers = async() => {
  const defaultPassword = 'password'

  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      email_confirm: true,
      password: defaultPassword,
      user_metadata: {
        username: user.username,
        displayname: user.displayname,
        description: user.description,
      },
    })
    if (error) {
      console.log(error);
      process.exit();
    }
  }
}

const uploadAvatars = async () => {
  const avatarsDir = './seed/test_avatars'
  for (const user of testUsers) {
    if (user.username === 'jakobyte00') continue // jakobyte user has no avatar

    const avatarBuffer = readFileSync(path.join(avatarsDir, user.username + '.jpg'))
    const avatarUrl = `public/${ user.id }.jpg`
    const { data: uploadResult, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(avatarUrl, avatarBuffer, {
        
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpg',
      })
    if (uploadError) {
      console.log(uploadError);
      process.exit();
    }

    // Set user as owner of the file
    await pgClient.query(`UPDATE storage.objects SET owner=$1::uuid, owner_id=$1::text WHERE id=$2`, [user.id, uploadResult.id]);
  }
}

const main = async () => {
  await pgClient.connect();
  await seedTestUsers();
  await uploadAvatars().catch(console.error);
  await pgClient.end();

  console.log("Database seeded successfully!");

  process.exit();
};

main();
