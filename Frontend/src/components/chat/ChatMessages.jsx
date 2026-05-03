import { useEffect, useRef } from "react";
import MessageBubble from "../MessageBubble";
import LoadingBubble from "../LoadingBubble";

function ChatMessages({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    
    <div className="flex flex-col gap-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {loading && <LoadingBubble />}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatMessages;
