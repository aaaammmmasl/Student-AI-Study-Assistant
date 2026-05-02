import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/chat/ChatMessages";
import ChatInput from "./components/chat/ChatInput";
// state
import { useChatStore } from "./app/chatStore";

function App() {
  const chat = useChatStore();
  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-white">
      <div className="flex h-full w-full">
        <Sidebar {...chat} />

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          <ChatHeader />

          <div className="flex-1 px-4 py-8 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <ChatMessages messages={chat.messages} loading={chat.loading} />

              <ChatInput {...chat} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
