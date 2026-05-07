/**
 * Cloud Functions for Feedback Aggregations
 * 
 * This file contains the logic for aggregating feedback data in real-time.
 * In a production environment, these would be deployed as Firebase Cloud Functions.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered when a new feedback document is created.
 */
export const onFeedbackCreated = functions.firestore
  .document('feedback/{feedbackId}')
  .onCreate(async (snapshot, context) => {
    const feedback = snapshot.data();
    if (!feedback) return;

    const { user_id, active_mode, created_at } = feedback;
    const dateKey = formatDateKey(created_at.toDate());

    const updates = [
      updateAggregate(db.doc(`users/${user_id}/feedback_summary/current`), feedback),
      updateAggregate(db.doc('analytics/global/current'), feedback),
      updateAggregate(db.doc(`analytics/modes/${active_mode}`), feedback),
      updateAggregate(db.doc(`analytics/daily/${dateKey}`), feedback)
    ];

    // Optional: Store recent comment
    if (feedback.has_comment) {
      updates.push(
        db.doc(`analytics/recent_comments/${context.params.feedbackId}`).set({
          feedback_id: context.params.feedbackId,
          user_id,
          active_mode,
          written_comment: feedback.written_comment,
          overall_satisfaction: feedback.ratings.overall_satisfaction,
          quality_score: feedback.quality_score,
          created_at
        })
      );
    }

    try {
      await Promise.all(updates);
      console.log(`Successfully aggregated feedback ${context.params.feedbackId}`);
    } catch (error) {
      console.error('Error aggregating feedback:', error);
    }
  });

/**
 * Helper to update an aggregate document using a transaction-like approach with FieldValue.increment.
 */
async function updateAggregate(docRef: admin.firestore.DocumentReference, feedback: any) {
  const count = 1;
  const ratings = feedback.ratings;

  const updateData: any = {
    feedback_count: admin.firestore.FieldValue.increment(count),
    'sums.functionality': admin.firestore.FieldValue.increment(ratings.functionality),
    'sums.technical_accuracy': admin.firestore.FieldValue.increment(ratings.technical_accuracy),
    'sums.link_relevance': admin.firestore.FieldValue.increment(ratings.link_relevance),
    'sums.usability': admin.firestore.FieldValue.increment(ratings.usability),
    'sums.overall_satisfaction': admin.firestore.FieldValue.increment(ratings.overall_satisfaction),
    'sums.quality_score': admin.firestore.FieldValue.increment(feedback.quality_score),
    would_use_again_count: admin.firestore.FieldValue.increment(feedback.would_use_again ? 1 : 0),
    comment_count: admin.firestore.FieldValue.increment(feedback.has_comment ? 1 : 0),
    last_updated_at: admin.firestore.FieldValue.serverTimestamp()
  };

  // Note: Averages are best calculated on the fly in the dashboard or by a separate 
  // scheduled function to avoid complex transaction logic for every write.
  // However, for small scale, we can just increment sums and counts.

  return docRef.set(updateData, { merge: true });
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}
