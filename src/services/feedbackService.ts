import { db, auth, serverTimestamp, collection, addDoc, query, where } from '../firebase';
import { doc, getDoc, runTransaction, setDoc, FieldValue, getDocs, deleteDoc } from 'firebase/firestore';

export interface FeedbackRatings {
  functionality: number;
  technical_accuracy: number;
  link_relevance: number;
  usability: number;
  overall_satisfaction: number;
}

export interface FeedbackPayload {
  session_id: string;
  response_id: string;
  active_mode: string;
  query_text?: string;
  ratings: FeedbackRatings;
  would_use_again: boolean;
  written_comment?: string;
  app_version?: string;
  response_meta: {
    domain_status: 'valid_genetics' | 'adjacent_biomed' | 'ambiguous' | 'out_of_domain';
    intent: string;
    verification_status: 'verified' | 'partial' | 'none';
    render_as: string;
  };
}

/**
 * Computes a weighted quality score from ratings.
 */
function computeQualityScore(ratings: FeedbackRatings): number {
  const score =
    ratings.functionality * 0.25 +
    ratings.technical_accuracy * 0.30 +
    ratings.link_relevance * 0.20 +
    ratings.usability * 0.15 +
    ratings.overall_satisfaction * 0.10;

  return Math.round(score * 100) / 100;
}

/**
 * Submits user feedback to Firestore.
 */
export async function submitFeedback(payload: FeedbackPayload) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to submit feedback.');
  }

  const quality_score = computeQualityScore(payload.ratings);
  const now = serverTimestamp();

  const feedbackData = {
    ...payload,
    user_id: user.uid,
    feedback_id: crypto.randomUUID(),
    has_comment: Boolean(payload.written_comment?.trim()),
    quality_score,
    created_at: now,
    updated_at: now,
    app_version: payload.app_version || '2.0.0',
  };

  try {
    // Check if we are replacing an existing feedback
    const existingFeedback = await getFeedbackForResponse(payload.response_id);
    
    const docRef = await addDoc(collection(db, 'feedback'), feedbackData);
    
    // In this preview environment, Cloud Functions are not active.
    // We implement the aggregation logic here to ensure the Analytics Dashboard works.
    const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const updateTasks = [
      updateAggregate(doc(db, 'analytics/global/data/current'), feedbackData, existingFeedback),
      updateAggregate(doc(db, `users/${user.uid}/feedback_summary/current`), feedbackData, existingFeedback),
      updateAggregate(doc(db, `analytics/modes/data/${payload.active_mode}`), feedbackData, existingFeedback),
      updateAggregate(doc(db, `analytics/daily/data/${dateKey}`), feedbackData, existingFeedback)
    ];

    if (existingFeedback) {
      // Delete the old feedback document
      updateTasks.push(deleteDoc(doc(db, 'feedback', existingFeedback.id)));
    }
    
    await Promise.all(updateTasks);
    
    return { ok: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

/**
 * Updates aggregated metrics in a transaction.
 */
async function updateAggregate(ref: any, feedback: any, oldFeedback?: any) {
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const current = snap.exists() ? snap.data() : buildEmptyAggregate();
    const next = applyFeedbackAggregate(current, feedback, oldFeedback);
    transaction.set(ref, next, { merge: true });
  });
}

function buildEmptyAggregate() {
  return {
    feedback_count: 0,
    mode_breakdown: {},
    sums: {
      functionality: 0,
      technical_accuracy: 0,
      link_relevance: 0,
      usability: 0,
      overall_satisfaction: 0,
      quality_score: 0
    },
    averages: {
      functionality: 0,
      technical_accuracy: 0,
      link_relevance: 0,
      usability: 0,
      overall_satisfaction: 0,
      quality_score: 0
    },
    would_use_again_count: 0,
    would_use_again_rate: 0,
    comment_count: 0,
    comment_rate: 0,
    last_updated_at: serverTimestamp()
  };
}

function applyFeedbackAggregate(current: any, feedback: any, oldFeedback?: any) {
  const isReplacement = !!oldFeedback;
  const count = (current.feedback_count || 0) + (isReplacement ? 0 : 1);

  // Update mode breakdown
  const modeBreakdown = { ...(current.mode_breakdown || {}) };
  const mode = feedback.active_mode;
  if (mode) {
    if (!modeBreakdown[mode]) {
      modeBreakdown[mode] = { feedback_count: 0 };
    }
    modeBreakdown[mode].feedback_count += (isReplacement ? 0 : 1);
    
    // If mode changed (rare)
    if (isReplacement && oldFeedback.active_mode && oldFeedback.active_mode !== mode) {
      if (modeBreakdown[oldFeedback.active_mode]) {
        modeBreakdown[oldFeedback.active_mode].feedback_count = Math.max(0, modeBreakdown[oldFeedback.active_mode].feedback_count - 1);
      }
    }
  }

  const sums = {
    functionality: (current.sums?.functionality || 0) + feedback.ratings.functionality - (oldFeedback?.ratings?.functionality || 0),
    technical_accuracy: (current.sums?.technical_accuracy || 0) + feedback.ratings.technical_accuracy - (oldFeedback?.ratings?.technical_accuracy || 0),
    link_relevance: (current.sums?.link_relevance || 0) + feedback.ratings.link_relevance - (oldFeedback?.ratings?.link_relevance || 0),
    usability: (current.sums?.usability || 0) + feedback.ratings.usability - (oldFeedback?.ratings?.usability || 0),
    overall_satisfaction: (current.sums?.overall_satisfaction || 0) + feedback.ratings.overall_satisfaction - (oldFeedback?.ratings?.overall_satisfaction || 0),
    quality_score: (current.sums?.quality_score || 0) + feedback.quality_score - (oldFeedback?.quality_score || 0)
  };

  const wouldUseAgainCount = (current.would_use_again_count || 0) + (feedback.would_use_again ? 1 : 0) - (oldFeedback ? (oldFeedback.would_use_again ? 1 : 0) : 0);
  const commentCount = (current.comment_count || 0) + (feedback.has_comment ? 1 : 0) - (oldFeedback ? (oldFeedback.has_comment ? 1 : 0) : 0);

  const round2 = (num: number) => Math.round(num * 100) / 100;

  return {
    ...current,
    feedback_count: count,
    mode_breakdown: modeBreakdown,
    sums,
    would_use_again_count: wouldUseAgainCount,
    comment_count: commentCount,
    averages: {
      functionality: round2(sums.functionality / Math.max(1, count)),
      technical_accuracy: round2(sums.technical_accuracy / Math.max(1, count)),
      link_relevance: round2(sums.link_relevance / Math.max(1, count)),
      usability: round2(sums.usability / Math.max(1, count)),
      overall_satisfaction: round2(sums.overall_satisfaction / Math.max(1, count)),
      quality_score: round2(sums.quality_score / Math.max(1, count))
    },
    would_use_again_rate: round2(wouldUseAgainCount / Math.max(1, count)),
    comment_rate: round2(commentCount / Math.max(1, count)),
    last_updated_at: serverTimestamp()
  };
}

/**
 * Checks if feedback exists for a specific response.
 */
export async function getFeedbackForResponse(responseId: string) {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, 'feedback'),
    where('user_id', '==', user.uid),
    where('response_id', '==', responseId)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
}

/**
 * Fetches aggregated feedback stats for a specific user.
 */
export async function getUserFeedbackStats(userId: string) {
  const summaryRef = doc(db, `users/${userId}/feedback_summary/current`);
  const summarySnap = await getDoc(summaryRef);

  if (!summarySnap.exists()) {
    return null;
  }

  return summarySnap.data();
}

/**
 * Fetches aggregated global feedback stats.
 */
export async function getGlobalFeedbackStats() {
  const ref = doc(db, 'analytics/global/data/current');
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

/**
 * Fetches aggregated feedback stats for a specific mode.
 */
export async function getModeFeedbackStats(modeId: string) {
  const ref = doc(db, `analytics/modes/data/${modeId}`);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

/**
 * RESET FUNCTION: Deletes all individual feedback and resets all aggregate metrics.
 * USE WITH CAUTION.
 */
export async function resetAllFeedbackData() {
  try {
    const user = auth.currentUser;
    // 1. Delete all individual feedback
    const feedbackSnap = await getDocs(collection(db, 'feedback'));
    console.log(`Deleting ${feedbackSnap.docs.length} feedback documents...`);
    const deleteFeedbackPromises = feedbackSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deleteFeedbackPromises);

    // 2. Clear analytics aggregates
    const emptyAggregate = buildEmptyAggregate();
    
    const allModes = [
      'asistente', 'evaluador', 'interprete', 'genes', 'proteinas', 
      'vias_de_señalizacion', 'glosario', 'simulador', 'reuniones', 
      'generador', 'patologias', 'epigenetica'
    ];
    
    const resetPromises = [
      setDoc(doc(db, 'analytics/global/data/current'), emptyAggregate),
      // Reset mode-specific analytics
      ...(allModes.map(m => 
        setDoc(doc(db, `analytics/modes/data/${m}`), emptyAggregate)
      ))
    ];

    // Reset current user's summary if authenticated
    if (user) {
      resetPromises.push(setDoc(doc(db, `users/${user.uid}/feedback_summary/current`), emptyAggregate));
    }

    // Try to clear some daily analytics (at least today's)
    const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
    resetPromises.push(setDoc(doc(db, `analytics/daily/data/${dateKey}`), emptyAggregate));
    
    await Promise.all(resetPromises);
    
    console.log('Feedback data reset successfully');
    return { success: true };
  } catch (error) {
    console.error('Error resetting feedback data:', error);
    throw error;
  }
}
