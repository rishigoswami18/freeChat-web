import { useState, useCallback, memo } from "react";
import { Send, Loader2 } from "lucide-react";
import { useContactSubmit } from "../../hooks/useContactSubmit";

/**
 * Isolated ContactForm Component.
 * Encapsulates controlled input state and prevents parent page from reacting.
 */
const ContactForm = memo(() => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        message: "",
    });

    const resetForm = useCallback(() => {
        setFormData({ fullName: "", email: "", message: "" });
    }, []);

    const { mutate: submitContact, isPending: isSubmitting } = useContactSubmit(resetForm);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        submitContact(formData);
    }, [formData, submitContact]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    return (
        <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body">
                <h2 className="card-title mb-4">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Full Name</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Jane Doe"
                            className="input input-bordered focus:border-primary w-full"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email Address</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="jane@example.com"
                            className="input input-bordered focus:border-primary w-full"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Message</span>
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="How can we help you?"
                            className="textarea textarea-bordered h-32 focus:border-primary w-full"
                            required
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary w-full gap-2 ${isSubmitting ? "opacity-90" : ""}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    );
});

ContactForm.displayName = "ContactForm";

export default ContactForm;
