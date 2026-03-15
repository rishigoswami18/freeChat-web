import { memo } from "react";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";

/**
 * ContactPage
 * Acts as a layout shell. UI components handle their own renders to prevent bottlenecking.
 */
const ContactPage = memo(() => {
    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-base-content sm:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mt-4 text-xl text-base-content/60">
                        Have questions about BondBeyond? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Contact Information */}
                    <ContactInfo />

                    {/* Right Column: Contact Form */}
                    <ContactForm />
                </div>
            </div>
        </div>
    );
});

ContactPage.displayName = "ContactPage";

export default ContactPage;
