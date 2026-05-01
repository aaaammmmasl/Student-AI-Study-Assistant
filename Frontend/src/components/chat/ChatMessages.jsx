import MessageBubble from "../MessageBubble";
import LoadingBubble from "../LoadingBubble";

function ChatMessages({ messages, loading }) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {loading && <LoadingBubble />}
    </div>
  );
}

export default ChatMessages;
