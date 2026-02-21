const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-sm sm:prose-base">
                <h1 className="text-3xl font-bold mb-8">Refund and Cancellation Policy</h1>
                <p className="opacity-70 text-sm mb-6 font-medium">Last Updated: February 22, 2026</p>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">1. Cancellations</h2>
                    <p>You may cancel your freeChat Premium membership at any time. To cancel, navigate to the Membership page in your account settings and click "Cancel Membership". Your premium access will continue until the end of the current billing period.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">2. Refunds</h2>
                    <p>Since freeChat Premium provides immediate access to digital features (including Couple Profiles), we generally do not offer refunds once a payment has been processed. However, if you believe there has been a billing error, please contact us at rishigoswamisl99@gmail.com within 7 days of the charge.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">3. Refund Processing</h2>
                    <p>In cases where a refund is approved, it will be processed and credited back to your original payment method (via Razorpay) within 5-7 business days.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">4. Changes to This Policy</h2>
                    <p>We reserve the right to modify this Refund and Cancellation Policy at any time. Any changes will be posted on this page with an updated revision date.</p>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
