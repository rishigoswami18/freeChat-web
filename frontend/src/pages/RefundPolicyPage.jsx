const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-sm sm:prose-base dark:prose-invert">
                <h1 className="text-4xl font-black mb-10 tracking-tight italic uppercase text-primary">Refund & Cancellation Policy</h1>
                <p className="opacity-70 text-sm mb-12 font-bold tracking-widest uppercase">Last Updated: March 12, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">1. Subscription Cancellation</h2>
                    <p className="leading-relaxed">
                        Users can cancel their <strong>BondBeyond Premium</strong> subscription at any time through their user dashboard or membership settings. 
                        Upon cancellation, your premium features will remain active until the end of the current billing cycle. No further charges will be applied.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">2. Refund Eligibility</h2>
                    <div className="space-y-4">
                        <p>We want you to be satisfied with BondBeyond. We offer a <strong>15-day money-back guarantee</strong> for new premium subscriptions if you find the service does not meet your expectations. To be eligible for a refund:</p>
                        <ul className="list-disc pl-5 space-y-2 opacity-80">
                            <li>The refund request must be made within 15 days of the initial purchase date.</li>
                            <li>The user must not have violated our Terms of Service.</li>
                            <li>Refunds are not applicable to the 'Gem' purchases once they have been partially or fully consumed within the app.</li>
                            <li>Refunds are not applicable to renewals or subsequent months of service.</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">3. Processing Refunds</h2>
                    <p className="leading-relaxed">
                        Once your refund request is submitted and reviewed, we will notify you of the approval or rejection. 
                        If approved, your refund will be initiated back to your original payment method (Credit Card, UPI, or Wallet). 
                        The credited amount should reflect in your account within <strong>5-10 business days</strong>, depending on your bank's processing time.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">4. Contact Support</h2>
                    <p className="bg-base-200 p-6 rounded-2xl border border-base-300">
                        For any refund, cancellation, or billing queries, please reach out to our dedicated support team:
                        <br /><br />
                        <span className="font-bold text-lg text-primary">freechatweb00@gmail.com</span>
                        <br />
                        <span className="text-sm opacity-60 italic">Expected response time: Within 24-48 hours.</span>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
