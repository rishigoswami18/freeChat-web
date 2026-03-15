import admin, { authApp, pushApp } from "../services/firebase/firebaseAdmin.js";

/**
 * LEGACY WRAPPER: Routes through the new modular Firebase infrastructure.
 * Maintains zero-breaking changes for the existing controllers.
 */

// Export instances exactly as they were used before
export const firebaseAuth = authApp ? authApp.auth() : null;
export const firebaseMessaging = pushApp ? pushApp.messaging() : null;

// Re-export the service wrappers for future use
export { getFirebaseAuth } from "../services/firebase/firebaseAuth.js";
export { getFirebaseMessaging } from "../services/firebase/firebaseMessaging.js";

export default admin;
