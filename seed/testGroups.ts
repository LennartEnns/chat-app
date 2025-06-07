import type { Enums } from "~~/database.types"

type TestGroup = {
  id: string,
  name: string,
  description: string | null,
  users: {
    id: string,
    role: Enums<'chatroom_role'>
  }[]
}

const testChatrooms: TestGroup[] = [
  {
    id: '3694a296-19ad-4351-8399-4584da6e4b70',
    name: 'Deine Mutter',
    description: null,
    users: [
      {
        id: 'bd988169-4773-44b2-94a9-1819d8052992',
        role: 'admin'
      },
      {
        id: 'b917de44-8070-49e5-b7c6-74d6f4a60f70',
        role: 'admin'
      },
      {
        id: 'a5e1d1aa-95f9-4ec5-8c10-b0604eb76b94',
        role: 'mod'
      },
      {
        id: '8dea4634-f0e9-4371-9732-03dcaa04cf17',
        role: 'member'
      },
      {
        id: 'e756b055-c014-43c6-b9b1-99c853fd085d',
        role: 'viewer'
      }
    ]
  },
  {
    id: '843837cd-19ff-4b91-ae02-573b7643acd4',
    name: 'The Boys',
    description: 'gangsta',
    users: [
      {
        id: 'a5e1d1aa-95f9-4ec5-8c10-b0604eb76b94',
        role: 'admin'
      },
      {
        id: 'c45d5012-99c3-4728-bd33-58e88ab0fcb4',
        role: 'member'
      }
    ]
  },
]
export default testChatrooms
