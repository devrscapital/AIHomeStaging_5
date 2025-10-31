
import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

const FAQ: React.FC<FAQProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-8">FAQ's</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-md">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex justify-between items-center text-left p-5 focus:outline-none"
              aria-expanded={openIndex === index}
            >
              <span className="text-lg font-semibold text-white">{item.question}</span>
              <svg
                className={`w-6 h-6 text-brand-secondary transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 text-gray-400 animate-fade-in">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
