# Pinterest Messages 💬✨

A luxury, dark-mode, real-time messaging web application with instant chat, media sharing, read receipts, and bi-directional **WebRTC Live HD Voice Calling**.

---

## ✨ Features

- **⚡ Real-Time Instant Messaging**: Powered by Supabase Realtime WebSocket broadcast channels with sub-50ms latency.
- **🎙️ WebRTC Live HD Voice Calling**:
  - Bi-directional audio calling with STUN NAT traversal.
  - Ultra-HD audio with 128 kbps fullband voice.
  - Live call duration timer, mute/speaker toggles, custom ringtones & disconnect chimes.
- **👀 Precision Read Receipts**:
  - Live dynamic transitions: `Sent` ➔ `Seen just now` (first 60 seconds) ➔ `Seen [time]` (e.g. `Seen 5:43 pm`).
  - Persistent read timestamp tracking that remains permanent across sessions.
- **📸 Rich Media & Attachments**: Send photos, videos, emojis, and voice messages with progress indicators and fullscreen preview modals.
- **👥 Contact Search & Profiles**: Search contacts by display name, view bio/profiles, and manage conversation threads.
- **📱 Ultra-Responsive Luxury UI**: Designed with glassmorphic cards, smooth animations, and tailored for both desktop and mobile viewports.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, React Icons
- **Backend & Database**: Supabase (PostgreSQL, Realtime Broadcast Channels, Storage)
- **Calling**: WebRTC API (`RTCPeerConnection`, `getUserMedia`, Google STUN Servers)

---

## 🛠️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/your-username/pinterest-messages.git
cd pinterest-messages
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🚢 Deploying to Vercel

1. Push your repository to **GitHub**.
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**! 🚀

---

## 📝 License
MIT License. Built with ❤️
