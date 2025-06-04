type TestUserFull = {
  id: string,
  email: string,
  username: string,
  displayname: string,
  description: string,
}
type TestUserOptional = 'displayname' | 'description'
type TestUser = Omit<TestUserFull, TestUserOptional> & Partial<Pick<TestUserFull, TestUserOptional>>

const testUsers: TestUser[] = [
  {
    id: 'bd988169-4773-44b2-94a9-1819d8052992',
    email: 'john.wick@gmail.gov',
    username: 'johnny',
    displayname: 'John Wick',
    description: 'How dare you look at my profile page?\n\
You leave me with no other choice...\n\
Enjoy your final 2 days, 14 hours, 42 minutes and 37 seconds.',
  },
  {
    id: 'c45d5012-99c3-4728-bd33-58e88ab0fcb4',
    email: 'pikachu@pokemon.com',
    username: 'pikachu',
    displayname: 'Pikachu',
    description: 'Pika Pika!',
  },
  {
    id: 'a5e1d1aa-95f9-4ec5-8c10-b0604eb76b94',
    email: 'omni-man@heroes.abc',
    username: 'omni-man',
    displayname: 'Omni-Man',
    description: 'I\'m out there doing whatever Omni-Man does...',
  },
  {
    id: '8dea4634-f0e9-4371-9732-03dcaa04cf17',
    email: 'bill.gates@illuminati.gov',
    username: 'gates',
    displayname: 'Bill Gates',
    description: 'Don\'t worry. It\'s only Micro when it\'s Soft ;)',
  },
  {
    id: 'b917de44-8070-49e5-b7c6-74d6f4a60f70',
    email: 'oppenheimer.robert@nukes.gov',
    username: 'oppenheimer',
    displayname: 'Julius Robert Oppenheimer',
    description: 'Now I am become Death, the Destroyer of Worlds',
  },
  {
    id: 'e756b055-c014-43c6-b9b1-99c853fd085d',
    email: 'jakobyte@gmail.com',
    username: 'jakobyte00',
  },
]
export default testUsers
