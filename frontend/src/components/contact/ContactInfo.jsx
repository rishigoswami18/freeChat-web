import { memo } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

/**
 * Isolated ContactInfo Component.
 * Prevents unnecessary re-renders when form states change heavily.
 */
const ContactInfo = memo(() => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                    <a href="mailto:freechatweb00@gmail.com" className="flex items-center gap-4 hover:bg-base-200 p-2 -m-2 rounded-xl transition-colors">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Mail className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-60">Email Address</p>
                            <p className="font-medium">freechatweb00@gmail.com</p>
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
    );
});

ContactInfo.displayName = "ContactInfo";

export default ContactInfo;
