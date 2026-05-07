import Loader from "./UI/Thinking";

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl border border-white/10 bg-zinc-900 px-5 py-4 text-sm text-zinc-400">
        <Loader/>
      </div>
    </div>
  );
}

export default LoadingBubble;
