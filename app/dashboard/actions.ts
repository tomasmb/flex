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

const BulkApprovalSchema = z.object({
  reviewIds: z.array(z.string()),
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
      data: { approvedForWebsite: validated.approved },
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

/**
 * Bulk approve/unapprove multiple reviews
 */
export async function bulkApproveReviews(reviewIds: string[], approved: boolean) {
  try {
    // Validate input
    const validated = BulkApprovalSchema.parse({ reviewIds, approved });

    // Update all reviews
    await db.review.updateMany({
      where: { id: { in: validated.reviewIds } },
      data: { approvedForWebsite: validated.approved },
    });

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/property/[slug]', 'page');

    return { success: true, count: validated.reviewIds.length };
  } catch (error) {
    console.error('Error bulk approving reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update reviews',
    };
  }
}

/**
 * Auto-approve all 5-star reviews
 */
export async function autoApproveHighRatedReviews() {
  try {
    const result = await db.review.updateMany({
      where: {
        overallRating: { gte: 5 },
        approvedForWebsite: false,
      },
      data: { approvedForWebsite: true },
    });

    revalidatePath('/dashboard');
    revalidatePath('/property/[slug]', 'page');

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error auto-approving reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to auto-approve reviews',
    };
  }
}
