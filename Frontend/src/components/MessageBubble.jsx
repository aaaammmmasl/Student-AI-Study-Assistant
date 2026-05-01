import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageBubble({ msg }) {
  return (
    <div
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[min(85%,46rem)] rounded-[24px] border px-6 py-5 shadow-sm ${
          msg.role === "user"
            ? "ml-auto border-lime-300/40 bg-lime-400 text-zinc-950"
            : "mr-auto border-white/10 bg-zinc-900 text-zinc-100"
        }`}
      >
        {msg.role === "user" ? (
          <div className="whitespace-pre-wrap text-[15px] font-medium leading-7">
            {msg.content}
          </div>
        ) : (
          <div className="space-y-3 text-[15px] leading-6 text-zinc-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="m-0 leading-6 text-zinc-200">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="mt-3 mb-1 text-xl font-semibold text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-3 mb-1 border-b border-white/10 pb-1 text-lg font-semibold text-white">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-2 mb-1 text-base font-medium text-white">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc space-y-1 pl-5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal space-y-1 pl-5">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-6 text-zinc-200">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-2 border-l-4 border-lime-400/40 pl-3 text-zinc-300">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-lime-300">
                      {children}
                    </code>
                  ) : (
                    <pre className="my-3 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-4">
                      <code className="text-lime-300">{children}</code>
                    </pre>
                  ),
                hr: () => <hr className="my-4 border-white/10" />,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
