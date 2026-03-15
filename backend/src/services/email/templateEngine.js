/**
 * Base template for all BondBeyond emails
 */
export const baseTemplate = (content, { title = "BondBeyond", appUrl = "https://www.bondbeyond.in", footerExtra = "" } = {}) => `
<div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:40px 30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:36px;font-style:italic;font-weight:900;letter-spacing:-1px;">BondBeyond</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0 0;font-size:13px;text-transform:uppercase;letter-spacing:3px;font-weight:600;">${title}</p>
    </div>

    <!-- Body -->
    <div style="padding:40px 30px;">
        ${content}
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
        ${footerExtra}
        <p style="color:#9ca3af;font-size:11px;margin:0;">You received this because you are a member of BondBeyond.</p>
        <p style="color:#d1d5db;font-size:11px;margin:8px 0 0 0;">© 2026 BondBeyond. All rights reserved.</p>
    </div>
</div>
`;

/**
 * OTP Template
 */
export const generateOtpContent = (otp, type = "verification") => `
<h2 style="color:#1f2937;margin:0 0 16px 0;font-size:24px;font-weight:800;">${type === 'verification' ? 'Verify your email' : 'Reset your password'}</h2>
<p style="color:#4b5563;line-height:1.8;font-size:16px;margin:0 0 24px 0;">
    Use the following code to ${type === 'verification' ? 'complete your registration' : 'reset your password'}:
</p>
<div style="margin:30px 0;text-align:center;">
    <span style="display:inline-block;padding:10px 30px;background:#f3f4f6;color:#6366f1;font-size:32px;font-weight:bold;letter-spacing:5px;border-radius:8px;border:1px dashed #6366f1;">${otp}</span>
</div>
<p style="color:#9ca3af;font-size:14px;text-align:center;">This code expires in 10 minutes.</p>
`;

/**
 * Welcome Template
 */
export const generateWelcomeContent = (firstName) => `
<h2 style="color:#1f2937;margin:0 0 16px 0;font-size:24px;font-weight:800;">Hi ${firstName}! 🎉</h2>
<p style="color:#4b5563;line-height:1.8;font-size:16px;margin:0 0 24px 0;">
    Thank you so much for joining BondBeyond! We're thrilled to have you here. You've just unlocked a world where you can chat with friends, share stories, match with language partners, and strengthen your relationships.
</p>
<div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e5e7eb;">
    <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">What you can do next:</p>
    <ul style="color:#4b5563;font-size:15px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Complete your profile for better matches</li>
        <li>Invite friends to join the app</li>
        <li>Check out our premium membership</li>
    </ul>
</div>
<div style="text-align:center;margin:32px 0;">
    <a href="https://www.bondbeyond.in" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 15px rgba(99,102,241,0.4);">
        Get Started →
    </a>
</div>
`;

/**
 * Notification Content
 */
export const generateNotificationContent = (emoji, title, body, ctaText, ctaUrl) => `
<div style="text-align:center;margin-bottom:20px;">
    <span style="font-size:48px;line-height:1;">${emoji || '🔔'}</span>
</div>
<h2 style="color:#1f2937;margin:0 0 12px 0;font-size:20px;font-weight:800;text-align:center;">${title}</h2>
<p style="color:#4b5563;line-height:1.7;font-size:15px;margin:0 0 28px 0;text-align:center;">${body}</p>
<div style="text-align:center;">
    <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(99,102,241,0.3);">
        ${ctaText || 'View Activity'} →
    </a>
</div>
`;
