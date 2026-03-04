import { firebaseAuth } from "../lib/firebase-admin.js";
import User from "../models/User.js";
import { sendInviteEmail } from "../lib/email.service.js";

/**
 * GET /admin/firebase-users
 * Fetches all Firebase users, cross-references with MongoDB,
 * and returns only those NOT registered in the app.
 */
export const getFirebaseNonUsers = async (req, res) => {
    try {
        if (!firebaseAuth) {
            return res.status(500).json({
                message: "Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON env variable."
            });
        }

        // Fetch all Firebase users (paginated — max 1000 per batch)
        const firebaseUsers = [];
        let nextPageToken;

        do {
            const listResult = await firebaseAuth.listUsers(1000, nextPageToken);
            listResult.users.forEach((userRecord) => {
                if (userRecord.email) {
                    firebaseUsers.push({
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName || "",
                        photoURL: userRecord.photoURL || "",
                        creationTime: userRecord.metadata.creationTime,
                    });
                }
            });
            nextPageToken = listResult.pageToken;
        } while (nextPageToken);

        // Get all registered emails from MongoDB
        const registeredUsers = await User.find({}, "email").lean();
        const registeredEmails = new Set(registeredUsers.map((u) => u.email.toLowerCase()));

        // Filter: only Firebase users who are NOT in MongoDB
        const nonUsers = firebaseUsers.filter(
            (fu) => !registeredEmails.has(fu.email.toLowerCase())
        );

        res.status(200).json({
            total: firebaseUsers.length,
            registered: registeredEmails.size,
            nonUsers,
        });
    } catch (error) {
        console.error("Error fetching Firebase users:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /admin/invite
 * Send invitation emails to selected Firebase non-users.
 * Body: { emails: ["email1@...", "email2@..."] }
 */
export const sendInvites = async (req, res) => {
    try {
        const { emails, subject, message } = req.body;
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: "No emails provided" });
        }

        // Double check these emails aren't already registered
        const existingUsers = await User.find({ email: { $in: emails } }, "email").lean();
        const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));

        const toInvite = emails.filter((e) => !existingEmails.has(e.toLowerCase()));

        if (toInvite.length === 0) {
            return res.status(400).json({ message: "All selected users are already registered!" });
        }

        console.log(`[Admin] Starting invite emails to ${toInvite.length} users...`);

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < toInvite.length; i++) {
            try {
                if (i > 0) await sleep(500); // Rate limit protection
                await sendInviteEmail(toInvite[i], subject, message);
                successCount++;
                console.log(`[Admin] [${successCount}/${toInvite.length}] ✅ Invite sent to: ${toInvite[i]}`);
            } catch (err) {
                console.error(`[Admin] ❌ Invite failed for ${toInvite[i]}:`, err.message);
                failCount++;
            }
        }

        console.log(`[Admin] 📧 Invite complete. Sent: ${successCount}, Failed: ${failCount}`);

        res.status(200).json({
            success: true,
            message: `Invites sent to ${successCount} users. Failed for ${failCount}.`,
            successCount,
            failCount,
            skipped: emails.length - toInvite.length,
        });
    } catch (error) {
        console.error("Error sending invites:", error);
        res.status(500).json({ message: error.message });
    }
};
