"use client";

import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="h-[100dvh] md:h-screen flex flex-col overflow-hidden">
      {/* Main Chat Interface - fills entire screen */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-0 md:pb-4 pt-4 md:pt-6 min-h-0 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}
