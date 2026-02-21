import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post("/api/support", formData);
            toast.success("Message sent! We'll get back to you soon.");
            setFormData({ fullName: "", email: "", message: "" });
        } catch (error) {
            console.error("Error submitting contact form:", error);
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-base-content sm:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mt-4 text-xl text-base-content/60">
                        Have questions about freeChat Premium? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                            <div className="space-y-6">
                                <a href="mailto:rishigoswamisl99@gmail.com" className="flex items-center gap-4 hover:bg-base-200 p-2 -m-2 rounded-xl transition-colors">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Mail className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-60">Email Address</p>
                                        <p className="font-medium">rishigoswamisl99@gmail.com</p>
                                    </div>
                                </a>

                                <a href="tel:+919905755603" className="flex items-center gap-4 hover:bg-base-200 p-2 -m-2 rounded-xl transition-colors">
                                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                        <Phone className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-60">Phone Number</p>
                                        <p className="font-medium">+91 9905755603</p>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4 p-2 -m-2">
                                    <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                        <MapPin className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-60">Office Address</p>
                                        <p className="font-medium text-sm">
                                            LPU University, <br />
                                            Phagwara, Punjab, India 144001
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-base-200 rounded-3xl border border-base-300">
                            <h3 className="font-bold flex items-center gap-2 mb-3">
                                <MessageCircle className="size-5 text-primary" />
                                Support Hours
                            </h3>
                            <ul className="text-sm space-y-2 opacity-70">
                                <li className="flex justify-between">
                                    <span>Monday - Friday</span>
                                    <span>9:00 AM - 6:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Saturday</span>
                                    <span>10:00 AM - 2:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Sunday</span>
                                    <span>Closed</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
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
                                    className={`btn btn-primary w-full gap-2 ${isSubmitting ? "loading" : ""}`}
                                    disabled={isSubmitting}
                                >
                                    {!isSubmitting && <Send className="size-4" />}
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
