import { useQuery } from "@tanstack/react-query";
import { getFriends } from "../lib/api";
import { User, MessageSquare } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { Link } from "react-router-dom";

const FriendsPage = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await getFriends();
      console.log("Friends fetched:", res); // Optional debug
      return res;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Your Friends</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : friends.length > 0 ? (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-4">
                    <div className="avatar w-14 h-14 rounded-full bg-base-300 overflow-hidden">
                      {friend.profilePic ? (
                        <img
                          src={friend.profilePic}
                          alt={friend.fullName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <User className="w-6 h-6 text-base-content opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{friend.fullName}</h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm">
                        <span className="badge badge-outline">
                          Native: {friend.nativeLanguage}
                        </span>
                        <span className="badge badge-secondary">
                          Learning: {friend.learningLanguage}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/chat/${friend._id}`}
                      className="btn btn-outline btn-sm flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoNotificationsFound message="No friends found yet." />
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
