// Free Trial: All premium features are free until this date
const FREE_TRIAL_END = new Date("2026-03-26T23:59:59");

/**
 * Check if a user has premium access.
 * During the free trial period, EVERYONE gets premium.
 * After the trial, only isMember or admin users get premium.
 */
export function isPremiumUser(authUser) {
    // Free trial active for everyone
    if (new Date() < FREE_TRIAL_END) return true;

    // Normal premium check
    return authUser?.isMember || authUser?.role === "admin";
}

/**
 * Check if the free trial is currently active.
 */
export function isFreeTrial() {
    return new Date() < FREE_TRIAL_END;
}

/**
 * Get the free trial end date.
 */
export function getFreeTrialEnd() {
    return FREE_TRIAL_END;
}
