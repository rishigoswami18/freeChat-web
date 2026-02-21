const TermsPage = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-sm sm:prose-base">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <p className="opacity-70 text-sm mb-6 font-medium">Last Updated: February 22, 2026</p>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing or using freeChat, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">2. Use of Services</h2>
                    <p>You agree to use freeChat only for lawful purposes and in accordance with these Terms. You are responsible for all content you post and interactions you have on the platform.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">3. Premium Memberships</h2>
                    <p>Premium memberships are billed on a monthly basis. All payments are processed securely via Razorpay. You can cancel your subscription at any time from your membership dashboard.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">4. Intellectual Property</h2>
                    <p>All content and materials available on freeChat, including but not limited to text, graphics, website name, code, images, and logos are the intellectual property of freeChat.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">5. Termination</h2>
                    <p>We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of our services.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
