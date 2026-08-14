'use client';

import { ChatProvider } from '@/context/ChatContext';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function Home() {
  return (
    <ChatProvider>
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center sm:p-6 md:p-8 relative overflow-hidden selection:bg-teal-500/30 selection:text-teal-200">
        {/* Background Decorative Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

        {/* Application Window Container */}
        <div className="w-full relative z-10 flex flex-col items-center">
          <ChatWindow />

          {/* Footer Branding - hidden on mobile */}
          <footer className="hidden sm:block mt-4 text-center text-xs text-slate-500 font-mono">
            Apexium AI Customer Assistant · AI Support Interface
          </footer>
        </div>
      </main>
    </ChatProvider>
  );
}
