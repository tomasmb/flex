/**
 * Approval Toggle Component (Client Component)
 * Toggle button with optimistic updates
 * Based on architecture@1.0.0#server-patterns.approval-toggle.v1
 */

'use client';

import { useState, useTransition } from 'react';
import { approveReview } from '@/app/dashboard/actions';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ApprovalToggleProps {
  reviewId: string;
  initialState: boolean;
}

export function ApprovalToggle({ reviewId, initialState }: ApprovalToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [approved, setApproved] = useState(initialState);

  const handleToggle = () => {
    // Optimistic update
    setApproved(!approved);

    // Server action
    startTransition(async () => {
      const result = await approveReview(reviewId, !approved);
      if (!result.success) {
        // Revert on error
        setApproved(approved);
        alert('Failed to update review: ' + result.error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        approved
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={approved ? 'Click to unapprove' : 'Click to approve'}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : approved ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      {approved ? 'Approved' : 'Not Approved'}
    </button>
  );
}
