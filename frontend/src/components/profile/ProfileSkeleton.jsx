import { memo } from "react";
import { Loader2 } from "lucide-react";

/**
 * Highly optimized, CSS-only skeleton structure that prevents JS tree calculations
 * and blocks layout shifts when the Profile mounts.
 */
const ProfileSkeleton = memo(() => {
    return (
        <div className="flex flex-col h-screen items-center justify-center relative w-full overflow-hidden" aria-busy="true" aria-label="Loading Profile...">
            {/* Soft decorative background pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Loader2 className="size-64 animate-spin-slow text-primary drop-shadow-2xl" />
            </div>

            <div className="max-w-4xl w-full p-4 sm:p-6 lg:p-8 relative z-10 opacity-70">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10 border-b border-base-300 pb-10">
                    {/* DP Skeleton */}
                    <div className="w-24 h-24 sm:w-36 sm:h-36 shrink-0 rounded-full bg-base-300 animate-pulse shadow-xl ring-4 ring-base-200" />
                    
                    {/* Details Skeleton */}
                    <div className="flex-1 text-center sm:text-left space-y-4 min-w-0 w-full">
                        <div className="h-6 w-32 bg-base-300 rounded-full animate-pulse mx-auto sm:mx-0" />
                        
                        <div className="flex items-center justify-center sm:justify-start gap-10 py-2">
                            <div className="h-10 w-12 bg-base-300 rounded-xl animate-pulse" />
                            <div className="h-10 w-12 bg-base-300 rounded-xl animate-pulse" />
                        </div>
                        
                        <div className="space-y-2 max-w-sm mx-auto sm:mx-0">
                            <div className="h-4 w-1/2 bg-base-300 rounded-full animate-pulse" />
                            <div className="h-4 w-3/4 bg-base-300 rounded-full animate-pulse" />
                            <div className="h-4 w-2/3 bg-base-300 rounded-full animate-pulse" />
                        </div>

                        {/* Badges Skeleton */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 pb-4">
                            <div className="h-6 w-20 bg-base-300 rounded-lg animate-pulse" />
                            <div className="h-6 w-24 bg-base-300 rounded-lg animate-pulse" />
                        </div>

                        {/* Buttons Skeleton */}
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 w-full pt-2">
                            <div className="h-8 w-full sm:w-32 bg-base-300 rounded-lg animate-pulse" />
                            <div className="h-8 w-full sm:w-32 bg-base-300 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Grid Navigation Skeleton */}
                <div className="flex justify-center border-b border-base-300 mb-6 gap-8">
                     <div className="h-6 w-24 bg-base-300 rounded-full animate-pulse mb-3" />
                     <div className="h-6 w-24 bg-base-300 rounded-full animate-pulse mb-3" />
                </div>

                {/* Posts Content Skeleton */}
                <div className="grid grid-cols-3 gap-1 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-base-300 rounded-sm sm:rounded-xl animate-pulse border border-base-200" />
                    ))}
                </div>
            </div>
        </div>
    );
});

ProfileSkeleton.displayName = "ProfileSkeleton";

export default ProfileSkeleton;
