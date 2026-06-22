"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ bathroomId }: { bathroomId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doorCode, setDoorCode] = useState("");
  const [rating, setRating] = useState(3);
  const [content, setContent] = useState("");
  const router = useRouter();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl active:bg-indigo-700 transition-colors">
        Add Code or Verify
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/bathrooms/${bathroomId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doorCode, rating, content, isVerification: true })
      });
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left border-t border-gray-100 pt-4 mt-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Door Code (Optional)</label>
        <input 
          type="text" 
          value={doorCode} 
          onChange={e => setDoorCode(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" 
          placeholder="e.g. 1234*" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness Rating (1-5)</label>
        <input 
          type="range" 
          min="1" max="5" 
          value={rating} 
          onChange={e => setRating(parseInt(e.target.value))} 
          className="w-full accent-indigo-600" 
        />
        <div className="text-center text-sm font-bold text-gray-700">{rating} Stars</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review / Notes (Optional)</label>
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" 
          rows={3} 
          placeholder="How was it? What's the best way to get in?" 
        />
      </div>
      <div className="flex gap-2">
        <button 
          type="button" 
          onClick={() => setIsOpen(false)} 
          className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-xl"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-xl disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
