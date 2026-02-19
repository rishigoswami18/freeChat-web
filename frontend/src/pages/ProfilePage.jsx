import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile } from "../lib/api";
import { Camera, MapPin, Globe, User, Languages, Loader2, Save, Shield, Keyboard } from "lucide-react";
import toast from "react-hot-toast";
import { useStealthStore } from "../store/useStealthStore";

const ProfilePage = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const { isStealthMode, setStealthMode, panicShortcut, setPanicShortcut } = useStealthStore();

    const [formData, setFormData] = useState({
        fullName: authUser?.fullName || "",
        bio: authUser?.bio || "",
        location: authUser?.location || "",
        nativeLanguage: authUser?.nativeLanguage || "",
        learningLanguage: authUser?.learningLanguage || "",
    });

    const [selectedImg, setSelectedImg] = useState(null);

    const { mutate: doUpdate, isPending } = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success("Profile updated successfully!");
            queryClient.setQueryData(["authUser"], data.user);
            // Also invalidate to be safe
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        doUpdate({
            ...formData,
            profilePic: selectedImg || undefined,
            isStealthMode,
            panicShortcut,
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-2">
                <User className="text-primary" />
                Update Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="relative group">
                        <div className="avatar">
                            <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300">
                                <img
                                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                                    alt="Profile"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <label
                            htmlFor="profile-upload"
                            className="absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg"
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
                    <p className="text-xs opacity-50">Click the camera to upload a new photo</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
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

                    {/* Location */}
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

                {/* Bio */}
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
                    {/* Native Language */}
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

                    {/* Learning Language */}
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
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn btn-primary w-full sm:w-auto min-w-[200px] gap-2 rounded-xl shadow-lg shadow-primary/20"
                    >
                        {isPending ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <Save className="size-5" />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>

            <div className="mt-12 pt-8 border-t">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="text-secondary" />
                    Stealth Mode Settings
                </h2>
                <div className="bg-base-200 p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Privacy Pro (Stealth Mode)</h3>
                            <p className="text-sm opacity-60">Instantly switch to a dummy educational view.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={isStealthMode}
                            onChange={(e) => setStealthMode(e.target.checked)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <Keyboard className="size-4 opacity-50" /> Panic Shortcut
                                </span>
                            </label>
                            <select
                                className="select select-bordered rounded-xl"
                                value={panicShortcut}
                                onChange={(e) => setPanicShortcut(e.target.value)}
                            >
                                <option value="Escape">Escape Key</option>
                                <option value="F2">F2 Key</option>
                                <option value="q">'q' Key</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <Globe className="size-4 opacity-50" /> Dummy View
                                </span>
                            </label>
                            <select className="select select-bordered rounded-xl" disabled>
                                <option>LexiLearn Dictionary (Default)</option>
                                <option>Science Lab Reports (Coming Soon)</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-info/10 text-info text-sm rounded-xl flex gap-3">
                        <div className="size-5 shrink-0"><Shield className="size-5" /></div>
                        <p><strong>Tip:</strong> You can quickly exit Stealth Mode by <strong>double-clicking</strong> the menu icon in the top right corner of the dummy view, or by pressing your shortcut key again.</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs opacity-40 mt-8 italic pb-10">
                All changes are saved instantly to your global profile.
            </p>
        </div>
    );
};

export default ProfilePage;
