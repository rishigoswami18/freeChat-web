import { memo } from "react";
import { Lock } from "lucide-react";

/**
 * Empty state displayed when a profile is private to the viewing user.
 */
const PrivateProfileState = memo(() => {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40 animate-in zoom-in-95 duration-500" role="status" aria-label="Private Profile Area">
            <Lock className="size-16" aria-hidden="true" />
            <h3 className="text-xl font-black uppercase tracking-widest italic">Private Profile</h3>
            <p className="text-sm">Follow this user to see their posts and friends</p>
        </div>
    );
});

PrivateProfileState.displayName = "PrivateProfileState";

export default PrivateProfileState;
