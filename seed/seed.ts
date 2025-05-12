/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */

// import { createSeedClient } from "@snaplet/seed";
import { createClient } from "@supabase/supabase-js";
import testUsers from "./testUsers";

const seedTestUsers = async() => {
  const defaultPassword = 'password'

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  })
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

const main = async () => {
  await seedTestUsers();

  // const seed = await createSeedClient();

  // Truncate all tables in the database
  // await seed.$resetDatabase();

  // Seed the database with some users
  // await seed.users([
  //   {
  //     email: 'john.wick@gmail.gov',
  //     raw_user_meta_data: {
  //       username: 'jonathan',
  //       displayname: 'John Wick',
  //     },
  //   }
  // ])

  console.log("Database seeded successfully!");

  process.exit();
};

main();
