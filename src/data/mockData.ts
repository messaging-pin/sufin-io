import { Chat, CallItem, ContactItem } from '../types';

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-batman',
    name: 'iAmBatman🦇',
    username: 'varsh_963',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'Okk',
    lastMessageTime: '5:22 PM',
    unreadCount: 0,
    readStatus: 'none',
    folder: 'all',
    isOnline: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'them',
        text: 'Tmrr our campus will conduct orientation so all the teachers will be in auditorium',
        isForwarded: true,
        forwardedLabel: 'Forwarded a message'
      },
      {
        id: 'msg-2',
        sender: 'me',
        text: 'So?'
      },
      {
        id: 'msg-3',
        sender: 'them',
        text: 'Nothing'
      },
      {
        id: 'msg-4',
        sender: 'them',
        text: "We'll have classes"
      },
      {
        id: 'msg-5',
        sender: 'me',
        text: 'You going to college?'
      },
      {
        id: 'msg-6',
        sender: 'them',
        text: 'Yeahh'
      },
      {
        id: 'msg-7',
        sender: 'me',
        text: 'Ok'
      },
      {
        id: 'msg-8',
        sender: 'me',
        text: 'Saketh ki phone chesa so he said',
        replyTo: {
          text: 'Tmrr our campus will conduct orientation so all the teachers will be in auditorium',
          senderName: 'iAmBatman🦇'
        }
      },
      {
        id: 'msg-9',
        sender: 'me',
        text: 'When I asked him about today orientation'
      },
      {
        id: 'msg-10',
        sender: 'them',
        text: 'Okk'
      }
    ]
  },
  {
    id: 'chat-1',
    name: 'Addie',
    username: 'addie_w',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'Sounds good!',
    lastMessageTime: '09:32',
    unreadCount: 0,
    readStatus: 'double-check-teal',
    folder: 'all',
    isOnline: false,
    messages: [
      {
        id: 'm1',
        sender: 'them',
        text: 'Hey! Are we still meeting for coffee today?'
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Yes! 4 PM works great.'
      },
      {
        id: 'm3',
        sender: 'them',
        text: 'Sounds good!'
      }
    ]
  },
  {
    id: 'chat-2',
    name: 'SLP',
    username: 'slp_official',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'https://youtu.be/LjHcHTJ8D...',
    lastMessageTime: '09:20',
    unreadCount: 0,
    readStatus: 'double-check-teal',
    folder: 'all',
    isOnline: false,
    messages: [
      {
        id: 'm4',
        sender: 'them',
        text: 'Check out this new track: https://youtu.be/LjHcHTJ8D...'
      }
    ]
  },
  {
    id: 'chat-3',
    name: 'Sunil',
    username: 'sunil_k',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'Let me know once you finish the prototype',
    lastMessageTime: '08:45',
    unreadCount: 1,
    readStatus: 'none',
    folder: 'unread',
    isOnline: true,
    messages: [
      {
        id: 'm5',
        sender: 'them',
        text: 'Let me know once you finish the prototype'
      }
    ]
  },
  {
    id: 'chat-4',
    name: 'Mike',
    username: 'mike_t',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    avatarBg: '#EAB308',
    lastMessage: 'Hey are you coming to the match tonight?',
    lastMessageTime: 'Yesterday',
    unreadCount: 2,
    readStatus: 'none',
    folder: 'unread',
    isOnline: false,
    messages: [
      {
        id: 'm6',
        sender: 'them',
        text: 'Hey are you coming to the match tonight?'
      }
    ]
  },
  {
    id: 'chat-5',
    name: 'Mum',
    username: 'mum_home',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'Call me when you reach home ❤️',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    readStatus: 'none',
    folder: 'all',
    isOnline: false,
    messages: [
      {
        id: 'm7',
        sender: 'them',
        text: 'Call me when you reach home ❤️'
      }
    ]
  }
];

export const INITIAL_CALLS: CallItem[] = [
  {
    id: 'call-1',
    contactName: 'iAmBatman🦇',
    contactAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    type: 'audio',
    direction: 'incoming',
    time: '5:10 PM',
    date: 'Today',
    duration: '4m 12s'
  },
  {
    id: 'call-2',
    contactName: 'Addie',
    contactAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    type: 'video',
    direction: 'outgoing',
    time: '09:15 AM',
    date: 'Today',
    duration: '12m 30s'
  },
  {
    id: 'call-3',
    contactName: 'Sunil',
    contactAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    type: 'audio',
    direction: 'missed',
    time: 'Yesterday',
    date: 'Yesterday'
  }
];

export const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: 'c-1',
    name: 'iAmBatman🦇',
    username: 'varsh_963',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    statusText: 'Active now',
    isOnline: true
  },
  {
    id: 'c-2',
    name: 'Addie',
    username: 'addie_w',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    statusText: 'Active 20m ago',
    isOnline: false
  },
  {
    id: 'c-3',
    name: 'SLP',
    username: 'slp_official',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    statusText: 'Listening to Spotify',
    isOnline: false
  }
];
