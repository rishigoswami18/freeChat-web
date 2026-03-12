const TermsPage = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-sm sm:prose-base dark:prose-invert">
                <h1 className="text-4xl font-black mb-10 tracking-tight italic uppercase text-primary">Terms of Service</h1>
                <p className="opacity-70 text-sm mb-12 font-bold tracking-widest uppercase">Last Updated: March 03, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">1. Agreement to Terms</h2>
                    <p className="leading-relaxed">
                        By accessing or using <strong>BondBeyond</strong>, you agree to be bound by these Terms of Service. If you disagree with any part of the terms,
                        you may not access the service. These terms apply to all visitors, users, and others who access the service.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">2. User Accounts</h2>
                    <div className="space-y-4">
                        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                        <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">3. Content and Conduct</h2>
                    <div className="space-y-4">
                        <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
                        <p><strong>Prohibited Activities:</strong></p>
                        <ul className="list-disc pl-5 space-y-2 opacity-80">
                            <li>Engaging in any illegal activity or promoting illegal acts.</li>
                            <li>Posting content that is defamatory, obscene, or infringing on intellectual property.</li>
                            <li>Sending unsolicited advertisements (SPAM).</li>
                            <li>Attempting to hack or disrupt the service.</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">4. Intellectual Property</h2>
                    <p className="leading-relaxed">
                        The Service and its original content, features, and functionality are and will remain the exclusive property of BondBeyond and its licensors.
                        Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of BondBeyond.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">5. Termination</h2>
                    <p className="leading-relaxed">
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without
                        limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">6. Limitation of Liability</h2>
                    <p className="leading-relaxed">
                        In no event shall freeChat, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential
                        or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">7. Contact Us</h2>
                    <p className="leading-relaxed">
                        If you have any questions about these Terms, please contact us at <span className="text-primary font-bold italic">freechatweb00@gmail.com</span>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
