import { Sparkles } from "lucide-react";
import { useAssistant } from "./useAssistant";

export default function AssistantLauncher() {
  const { isOpen, open, launcherRef } = useAssistant();

  return (
    <button
      ref={launcherRef}
      type="button"
      onClick={open}
      title="Open AI assistant"
      aria-label="Open AI assistant"
      aria-hidden={isOpen}
      tabIndex={isOpen ? -1 : 0}
      className={`fixed right-4 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition-all duration-300 ease-out motion-reduce:transition-none hover:bg-rose-700 hover:shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${
        isOpen ? "pointer-events-none scale-0 opacity-0" : "opacity-100"
      }`}
    >
      <Sparkles size={20} />
    </button>
  );
}
