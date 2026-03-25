import { useState, useEffect, memo } from "react";
import { Camera, MapPin, Globe, User, Languages, Calendar, Save, Loader2, Shield, Sparkles } from "lucide-react";

/**
 * EditProfileForm
 * Isolates local form state, reducing render cycles on the parent component
 */
const EditProfileForm = memo(({ authUser, isPremium, isStealthMode, panicShortcut, isPending, onSubmit }) => {
    const [selectedImg, setSelectedImg] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        location: "",
        nativeLanguage: "",
        learningLanguage: "",
        dateOfBirth: "",
        isPublic: true,
        aiPartnerName: "",
        aiFriendName: "",
        instagram: "",
        linkedin: "",
    });

    useEffect(() => {
        if (authUser) {
            setFormData({
                fullName: authUser.fullName || "",
                bio: authUser.bio || "",
                location: authUser.location || "",
                nativeLanguage: authUser.nativeLanguage || "",
                learningLanguage: authUser.learningLanguage || "",
                dateOfBirth: authUser.dateOfBirth ? authUser.dateOfBirth.split("T")[0] : "",
                isPublic: authUser.isPublic !== undefined ? authUser.isPublic : true,
                aiPartnerName: authUser.aiPartnerName || "",
                aiFriendName: authUser.aiFriendName || "",
                instagram: authUser.instagram || "",
                linkedin: authUser.linkedin || "",
            });
        }
    }, [authUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // [OPTIMIZATION]: Prepared for direct Cloudinary/S3 upload flow.
            // In a production direct-upload scenario:
            // 1. Upload file directly to S3/Cloudinary using signed URL
            // 2. Pass resulting URL down instead of base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (selectedImg) payload.profilePic = selectedImg;

        if (isPremium) {
            payload.isStealthMode = isStealthMode;
            payload.panicShortcut = panicShortcut;
        }

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8 profile-cover-gradient rounded-2xl py-10 px-4 relative">
                <div className="relative group">
                    <div className="avatar">
                        <div
                            className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300 cursor-pointer active:scale-95 transition-transform relative"
                            onClick={() => document.getElementById("profile-upload").click()}
                        >
                            <img
                                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                                alt="Profile"
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                                <Camera className="size-6" />
                                <span>CHANGE</span>
                            </div>
                        </div>
                    </div>
                    <label
                        htmlFor="profile-upload"
                        className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-xl border border-black/5 z-20"
                    >
                        <Camera className="size-5" />
                        <input
                            id="profile-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest bg-base-200 px-4 py-1.5 rounded-full border border-base-300">
                    Tap Photo to Upload
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                            <User className="size-4 opacity-50" /> Full Name
                        </span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="input input-bordered focus:input-primary transition-all rounded-xl"
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                            <MapPin className="size-4 opacity-50" /> Location
                        </span>
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="input input-bordered focus:input-primary transition-all rounded-xl"
                    />
                </div>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-semibold">Bio</span>
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="textarea textarea-bordered focus:textarea-primary transition-all rounded-xl h-24"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                            <Globe className="size-4 opacity-50" /> Native Language
                        </span>
                    </label>
                    <input
                        type="text"
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleInputChange}
                        placeholder="e.g. English"
                        className="input input-bordered focus:input-primary transition-all rounded-xl"
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                            <Languages className="size-4 opacity-50" /> Learning Language
                        </span>
                    </label>
                    <input
                        type="text"
                        name="learningLanguage"
                        value={formData.learningLanguage}
                        onChange={handleInputChange}
                        placeholder="e.g. Spanish"
                        className="input input-bordered focus:input-primary transition-all rounded-xl"
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                            <Calendar className="size-4 opacity-50" /> Date of Birth
                        </span>
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="input input-bordered focus:input-primary transition-all rounded-xl"
                        required
                    />
                </div>
            </div>

            {/* Social Connectivity Section */}
            <div className="bg-base-200/50 p-6 rounded-2xl border border-base-content/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-50">Social Reach</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label pt-0">
                            <span className="label-text font-semibold text-xs flex items-center gap-2">
                                <Globe className="size-3" /> Instagram Handle
                            </span>
                        </label>
                        <input
                            type="text"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleInputChange}
                            placeholder="@username"
                            className="input input-sm input-bordered focus:input-primary transition-all rounded-lg"
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label pt-0">
                            <span className="label-text font-semibold text-xs flex items-center gap-2">
                                <Shield className="size-3" /> LinkedIn URL / Handle
                            </span>
                        </label>
                        <input
                            type="text"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            placeholder="username"
                            className="input input-sm input-bordered focus:input-primary transition-all rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* AI Customization Section */}
            <div className="bg-base-200/50 p-6 rounded-2xl border border-base-content/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                    <Sparkles className="size-4" /> AI Customization
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label pt-0">
                            <span className="label-text font-semibold text-xs">GF / Partner Name</span>
                        </label>
                        <input
                            type="text"
                            name="aiPartnerName"
                            value={formData.aiPartnerName}
                            onChange={handleInputChange}
                            placeholder="Aria"
                            className="input input-sm input-bordered focus:input-primary transition-all rounded-lg"
                        />
                    </div>
                    
                    <div className="form-control">
                        <label className="label pt-0">
                            <span className="label-text font-semibold text-xs">Bestie Name</span>
                        </label>
                        <input
                            type="text"
                            name="aiFriendName"
                            value={formData.aiFriendName}
                            onChange={handleInputChange}
                            placeholder="Golu"
                            className="input input-sm input-bordered focus:input-primary transition-all rounded-lg"
                        />
                    </div>
                </div>
            </div>


            <div className="bg-base-200 p-4 rounded-xl flex items-center justify-between border border-primary/5">
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm flex items-center gap-2">
                        {formData.isPublic ? <Globe className="size-4 text-success" /> : <Shield className="size-4 text-warning" />}
                        Profile Visibility
                    </span>
                    <p className="text-xs opacity-50">
                        {formData.isPublic
                            ? "Your profile is public and discoverable by others."
                            : "Your profile is private and hidden from search/recommendations."}
                    </p>
                </div>
                <input
                    type="checkbox"
                    name="isPublic"
                    className="toggle toggle-success"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                />
            </div>

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary w-full sm:w-auto min-w-[200px] gap-2 rounded-xl shadow-lg shadow-primary/20"
                >
                    {isPending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
});

EditProfileForm.displayName = "EditProfileForm";

export default EditProfileForm;
