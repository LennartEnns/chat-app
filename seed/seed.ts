import { createClient } from "@supabase/supabase-js";
import testUsers from "./testUsers";
import { readFileSync } from 'fs';
import path from "path";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
})

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
    const { error } = await supabase
      .storage
      .from('avatars')
      .upload(avatarUrl, avatarBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpg',
      })
    if (error) {
      console.log(error);
      process.exit();
    }
  }
}

const main = async () => {
  await seedTestUsers();
  await uploadAvatars();

  console.log("Database seeded successfully!");

  process.exit();
};

main();
