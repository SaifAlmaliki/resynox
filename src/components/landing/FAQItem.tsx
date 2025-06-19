import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <span className="font-medium">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div 
        className={`px-6 overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'pb-4 max-h-96' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 dark:text-gray-400">{answer}</p>
      </div>
    </div>
  );
} 