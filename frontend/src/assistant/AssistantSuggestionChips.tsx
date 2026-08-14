interface AssistantSuggestionChipsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS = [
  "Please find me the bookings for my company, and summarize the results.",
  "What's coming up next week?",
  "How are my listings performing?",
];

export default function AssistantSuggestionChips({
  onSelect,
}: AssistantSuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {SUGGESTIONS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 active:bg-rose-50 active:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
