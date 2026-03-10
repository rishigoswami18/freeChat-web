import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { Bell, Clock, MessageSquare, UserCheck, Inbox, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { ChatSkeleton } from "../components/Skeletons";
import { motion, AnimatePresence } from "framer-motion";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const incomingRequests = (friendRequests?.incomingReqs || []).filter(req => req.sender);
  const acceptedRequests = (friendRequests?.acceptedReqs || []).filter(req => req.recipient);

  const tabs = [
    { id: "requests", label: "Requests", icon: UserCheck, count: incomingRequests.length },
    { id: "activity", label: "Activity", icon: Bell, count: acceptedRequests.length }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section with Glassmorphism */}
      <div className="sticky top-0 z-20 bg-base-100/60 backdrop-blur-xl border-b border-base-content/5 px-4 py-6 sm:px-8">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-2xl">
                <Bell className="size-6 sm:size-7 text-primary animate-pulse" />
              </span>
              Notifications
            </h1>
            <p className="text-xs text-base-content/50 font-medium mt-1 ml-1">
              Stay updated with your love life activity
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 mt-8">
        {/* Custom Tab Switcher */}
        <div className="flex p-1.5 bg-base-200/50 backdrop-blur-md rounded-[24px] border border-base-content/5 mb-8 w-full sm:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-[20px] text-sm font-bold transition-all duration-300 relative ${activeTab === tab.id
                ? 'text-primary'
                : 'text-base-content/50 hover:text-base-content/80'
                }`}
            >
              <tab.icon className={`size-4 ${activeTab === tab.id ? 'animate-bounce' : ''}`} />
              {tab.label}
              {tab.count > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-white font-black shadow-lg shadow-primary/20">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-base-300 shadow-sm rounded-[20px] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-base-200/50 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "requests" ? (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {incomingRequests.length > 0 ? (
                  incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="group relative bg-base-100 border border-base-content/5 rounded-[32px] p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
                    >
                      {/* Brand accent */}
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="size-5 text-primary/40 animate-pulse" />
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative">
                          <div className="size-16 sm:size-20 rounded-[24px] overflow-hidden border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                            <img
                              src={request.sender.profilePic || "/avatar.png"}
                              alt={request.sender.fullName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-xl border-4 border-base-100 shadow-lg">
                            <UserCheck className="size-3" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-base-content truncate group-hover:text-primary transition-colors">
                            {request.sender.fullName}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-full border border-secondary/10">
                              NATIVE: {request.sender.nativeLanguage}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/10">
                              LEARNING: {request.sender.learningLanguage}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                            className="btn btn-primary btn-md rounded-2xl px-8 font-black shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isPending ? <span className="loading loading-spinner loading-xs" /> : "Accept"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <NoNotificationsFound />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {acceptedRequests.length > 0 ? (
                  acceptedRequests.map((notification) => (
                    <div
                      key={notification._id}
                      className="bg-base-200/40 backdrop-blur-md border border-base-content/5 rounded-[32px] p-5 hover:bg-base-200/60 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-12 rounded-[18px] overflow-hidden border border-base-content/10">
                          <img
                            src={notification.recipient.profilePic || "/avatar.png"}
                            alt={notification.recipient.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-sm">{notification.recipient.fullName}</h3>
                            <span className="size-1 bg-base-content/20 rounded-full" />
                            <span className="text-[10px] text-success font-black uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 className="size-3" />
                              Connected
                            </span>
                          </div>
                          <p className="text-sm text-base-content/70">
                            Accepted your connection request. Say hi to your new friend!
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 opacity-40">
                              <Clock className="size-3" />
                              <span className="text-[10px] font-bold">Recently</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
                              <MessageSquare className="size-3" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Start Chat</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-pink-500/10 p-2.5 rounded-2xl">
                          <Heart className="size-4 text-pink-500 fill-pink-500/20" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <Inbox className="size-12 mb-4" />
                    <p className="font-black text-sm uppercase tracking-widest">No Recent Activity</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
