'use client';

import { useState } from "react";
import { FAQItem } from "./FAQItem";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  subtitle: string;
  faqs: FAQ[];
}

export function FAQSection({ title, subtitle, faqs }: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto stagger-container">
        {faqs.map((faq, index) => (
          <div key={index} className="stagger-item" style={{ '--item-index': index } as any}>
            <FAQItem
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === index}
              onToggle={() => toggleFaq(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 