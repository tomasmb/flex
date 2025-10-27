/**
 * Server Actions for Dashboard
 * Type-safe mutations with automatic revalidation
 * Based on nextjs-best-practices@1.0.0#api-routes-vs-server-actions.v1
 */

'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schemas
const ApprovalSchema = z.object({
  reviewId: z.string(),
  approved: z.boolean(),
});

/**
 * Toggle review approval status
 */
export async function approveReview(reviewId: string, approved: boolean) {
  try {
    // Validate input
    const validated = ApprovalSchema.parse({ reviewId, approved });

    // Update database
    await db.review.update({
      where: { id: validated.reviewId },
      data: { isPublished: validated.approved },
    });

    // Revalidate dashboard and property pages
    revalidatePath('/dashboard');
    revalidatePath('/property/[slug]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error approving review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update review',
    };
  }
}

