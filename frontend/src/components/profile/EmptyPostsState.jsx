import { memo } from "react";
import { Grid } from "lucide-react";

/**
 * Rendered when a public profile has validly fetched its feed, but it is empty.
 */
const EmptyPostsState = memo(() => {
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 italic animate-in zoom-in-95 duration-500" role="status" aria-label="No posts available">
            <Grid className="size-12 mb-4" aria-hidden="true" />
            <p>No posts yet</p>
        </div>
    );
});

EmptyPostsState.displayName = "EmptyPostsState";

export default EmptyPostsState;
