import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { readFileSync } from 'fs';
import path from "path";
import testUsers from "./testUsers";
import testChatrooms from "./testChatrooms";
import * as queries from "./queries";

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
        upsert: false,
        contentType: 'image/jpeg',
        cacheControl: '0',
        headers: {
          'cache-control': 'no-cache',
        },
      })
    if (uploadError) {
      console.log(uploadError);
      process.exit();
    }

    // Set user as owner of the file
    await pgClient.query(queries.updateStorageObjectOwnerQuery, [user.id, uploadResult.id]);
  }
}

const seedChatrooms = async () => {
  for (const chatroom of testChatrooms) {
    // Create the chatroom
    await pgClient.query(queries.createChatroomQuery, [chatroom.id, chatroom.name, chatroom.description]);

    // Add the users
    for (const user of chatroom.users) {
      // Add user
      await pgClient.query(queries.addUserToChatroomQuery, [user.id, chatroom.id, user.role]);
    }
  }
}

const main = async () => {
  console.log("Connecting to DB...");
  await pgClient.connect();
  console.log("Seeding users...");
  await seedTestUsers();
  console.log("Uploading avatars...");
  await uploadAvatars().catch(console.error);
  console.log("Seeding chatrooms...");
  await seedChatrooms().catch(console.error);
  console.log("Closing DB connection...");
  await pgClient.end();

  console.log("Database seeded successfully!");

  process.exit();
};

main();
