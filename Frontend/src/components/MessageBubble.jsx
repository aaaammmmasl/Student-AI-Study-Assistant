import { useState } from "react";
import { Copy, Check } from "lucide-react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const formattedContent = msg.content
    .replace(/(#{1,6}\s)/g, "\n$1")
    .replace(/-\s\*\*/g, "\n- **")
    .replace(/\n{3,}/g, "\n\n");

  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-2 max-w-[min(85%,46rem)]">
        <div
          className={`rounded-[24px] border px-6 py-5 shadow-sm ${
            isUser
              ? "border-lime-300/40 bg-lime-400 text-zinc-950"
              : "border-white/10 bg-zinc-900 text-zinc-100"
          }`}
        >
          {isUser ? (
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
                  code({ inline, className, children }) {
                    const match = /language-(\w+)/.exec(className || "");

                    if (inline) {
                      return (
                        <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-lime-300">
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="my-2 max-w-full overflow-x-auto rounded-2xl border border-white/10">
                        <SyntaxHighlighter
                          language={match?.[1] || "text"}
                          style={oneDark}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            background: "#09090b",
                            padding: "14px 16px",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            overflowX: "auto",
                            maxWidth: "100%",
                          }}
                          codeTagProps={{
                            style: {
                              background: "transparent",
                              whiteSpace: "pre",
                            },
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },

                  table: ({ children }) => (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        {children}
                      </table>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-zinc-800">{children}</thead>
                  ),

                  th: ({ children }) => (
                    <th className="border border-white/10 px-4 py-2 text-left text-white">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border border-white/10 px-4 py-2 text-zinc-300">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-4 border-white/10" />,
                }}
              >
                {formattedContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <div className="px-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
