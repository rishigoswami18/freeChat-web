import { memo } from "react";
import StoryTray from "../StoryTray";

const FeedStories = memo(() => {
  return (
    <div className="mb-4 sm:mb-6 w-full overflow-hidden max-w-[470px] mx-auto lg:max-w-[630px] animate-in fade-in duration-500">
      <StoryTray />
    </div>
  );
});

FeedStories.displayName = "FeedStories";

export default FeedStories;
