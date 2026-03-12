const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-sm sm:prose-base dark:prose-invert">
                <h1 className="text-4xl font-black mb-10 tracking-tight italic uppercase text-primary">Privacy Policy</h1>
                <p className="opacity-70 text-sm mb-12 font-bold tracking-widest uppercase">Last Updated: March 03, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">1. Introduction</h2>
                    <p className="leading-relaxed">
                        Welcome to <strong>BondBeyond</strong> (freechatweb.in). We are committed to protecting your personal information and your right to privacy.
                        If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at
                        <span className="text-primary italic px-1 underline underline-offset-4 decoration-primary/40 font-medium">freechatweb00@gmail.com</span>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">2. Information We Collect</h2>
                    <div className="space-y-4">
                        <p>We collect personal information that you voluntarily provide to us when registering at freeChat, expressing an interest in obtaining information about us or our products and services, when participating in activities on our site, or otherwise contacting us.</p>
                        <ul className="list-disc pl-5 space-y-2 opacity-80">
                            <li><strong>Personal Information:</strong> Name, Email Address, Gender, Date of Birth.</li>
                            <li><strong>Content Provided:</strong> Chat messages, posts, reels, and stories.</li>
                            <li><strong>Credentials:</strong> Passwords and similar security info.</li>
                            <li><strong>Payment Data:</strong> Payment details via our secure third-party payment gateways (not stored on our servers).</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">3. Google AdSense & Third-Party Advertising</h2>
                    <div className="space-y-4">
                        <p>We use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
                        <p><strong>Google AdSense & DoubleClick Cookie:</strong></p>
                        <ul className="list-disc pl-5 space-y-2 opacity-80">
                            <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
                            <li>Google's use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet.</li>
                            <li>Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">4. Cookies and Web Beacons</h2>
                    <p className="leading-relaxed">
                        Like any other website, freeChat uses 'cookies'. These cookies are used to store information including visitors' preferences,
                        and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience
                        by customizing our web page content based on visitors' browser type and/or other information.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">5. Data Retention & Privacy Rights</h2>
                    <div className="space-y-4">
                        <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.</p>
                        <p><strong>GDPR/CCPA Compliance:</strong> If you are a resident of the European Economic Area (EEA) or California, you have certain data protection rights, including the right to access, rectify, or erase your data. Please contact us to exercise these rights.</p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-base-content/90 border-b border-primary/20 pb-2">6. Contact Information</h2>
                    <p className="bg-base-200 p-6 rounded-2xl border border-base-300">
                        If you have questions about this policy, you may email us at:
                        <br />
                        <span className="font-bold text-lg text-primary">freechatweb00@gmail.com</span>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
