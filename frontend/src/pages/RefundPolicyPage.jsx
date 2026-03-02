const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-sm sm:prose-base dark:prose-invert">
                <h1 className="text-4xl font-black mb-10 tracking-tight italic uppercase text-primary">Refund & Cancellation Policy</h1>
                <p className="opacity-70 text-sm mb-12 font-bold tracking-widest uppercase">Last Updated: March 03, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">1. Subscription Cancellation</h2>
                    <p className="leading-relaxed">
                        Users can cancel their <strong>freeChat Premium</strong> subscription at any time through their membership dashboard.
                        Upon cancellation, your premium features will remain active until the end of the current billing cycle.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">2. Refund Eligibility</h2>
                    <div className="space-y-4">
                        <p>We offer a <strong>7-day money-back guarantee</strong> for new premium subscriptions if you are unsatisfied with our service. To be eligible for a refund:</p>
                        <ul className="list-disc pl-5 space-y-2 opacity-80">
                            <li>The request must be made within 7 days of the initial purchase.</li>
                            <li>You must provide a valid reason for the refund to help us improve our service.</li>
                            <li>Refunds are not applicable to renewals or subsequent months of service.</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">3. Processing Refunds</h2>
                    <p className="leading-relaxed">
                        Once your refund request is received and inspected, we will notify you of the approval or rejection of your refund.
                        If approved, your refund will be processed via <strong>Razorpay</strong>, and a credit will automatically be applied to
                        your original method of payment within 5-7 working days.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">4. Contact Us for Refunds</h2>
                    <p className="bg-base-200 p-6 rounded-2xl border border-base-300">
                        For any refund or cancellation queries, please email our support team:
                        <br />
                        <span className="font-bold text-lg text-primary">freechatweb00@gmail.com</span>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
