import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Utils
import useAuthUser from "../hooks/useAuthUser";
import { isPremiumUser } from "../lib/premium";

// API
import {
    getCoupleStatus,
    sendCoupleRequest,
    acceptCoupleRequest,
    unlinkCouple,
    getFriends,
    getMembershipStatus,
    updateRomanticNote,
    buyVerification,
    getDailyInsight,
    updateMood,
    linkAI,
} from "../lib/api";

// Sub-components
import HeartParticles from "../components/couple/HeartParticles";
import AgeRestrictedView from "../components/couple/AgeRestrictedView";
import PremiumRequiredView from "../components/couple/PremiumRequiredView";
import CoupleHero from "../components/couple/CoupleHero";
import CoupleMoodHarmony from "../components/couple/CoupleMoodHarmony";
import CoupleSacredRitual from "../components/couple/CoupleSacredRitual";
import CoupleWallet from "../components/couple/CoupleWallet";
import CoupleVerification from "../components/couple/CoupleVerification";
import CoupleRomanticNote from "../components/couple/CoupleRomanticNote";
import CouplePartnerCard from "../components/couple/CouplePartnerCard";
import CoupleActivities from "../components/couple/CoupleActivities";
import PendingCoupleView from "../components/couple/PendingCoupleView";
import SingleView from "../components/couple/SingleView";

// Utility function to calculate age
const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

const CoupleProfilePage = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();

    // Local UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [customAiName, setCustomAiName] = useState("");
    const [isLinkingAI, setIsLinkingAI] = useState(false);

    // ================== REACT QUERY DATA FETCHING ==================
    const { data: insightData } = useQuery({
        queryKey: ["dailyInsight"],
        queryFn: getDailyInsight,
        staleTime: 1000 * 60 * 5, // 5 min cache
        cacheTime: 1000 * 60 * 30, // 30 min gc
        refetchOnWindowFocus: false, // Prevent lag on alt+tab
    });

    const { data: coupleData, isLoading: coupleLoading } = useQuery({
        queryKey: ["coupleStatus"],
        queryFn: getCoupleStatus,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    const { data: friends = [] } = useQuery({
        queryKey: ["friends"],
        queryFn: getFriends,
        staleTime: 1000 * 60 * 5, // Don't refetch friend lists constantly
        refetchOnWindowFocus: false,
    });

    const { data: memberData, isLoading: memberLoading } = useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
        staleTime: 1000 * 60 * 15, // Membership rarely updates
        refetchOnWindowFocus: false,
    });

    // ================== MEMOIZED COMPUTATIONS ==================
    const userAge = useMemo(() => calculateAge(authUser?.dateOfBirth), [authUser?.dateOfBirth]);
    
    const filteredFriends = useMemo(() => {
        return friends.filter((f) => f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [friends, searchTerm]);

    const { coupleStatus, partner, coupleRequestSenderId, romanticNote, romanticNoteLastUpdated, isBothAdult } = coupleData || {};
    
    const iReceivedRequest = coupleStatus === "pending" && partner && coupleRequestSenderId && coupleRequestSenderId !== authUser?._id;
    const streakCount = insightData?.coupleStreak || authUser?.coupleStreak || 0;

    // ================== STABILIZED MUTATION HANDLERS ==================
    const { mutate: handleUpdateMood, isPending: isUpdatingMood } = useMutation({
        mutationFn: updateMood,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["dailyInsight"] });
            queryClient.setQueryData(["authUser"], (old) => ({ ...old, user: { ...old.user, mood: data.user.mood, coupleStreak: data.user.coupleStreak } }));
            toast.success("Mood shared with your partner! ✨");
        }
    });

    const { mutate: handleBuyVerification, isPending: isBuyingVerification } = useMutation({
        mutationFn: buyVerification,
        onSuccess: () => {
            toast.success("Verification badge activated! 🎉");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to buy verification")
    });

    const { mutate: handleLinkAI, isPending: linkingAI } = useMutation({
        mutationFn: linkAI,
        onSuccess: (data) => {
            toast.success(`Linked with ${data.user.aiPartnerName}! ❤️`);
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            setIsLinkingAI(false);
            setCustomAiName(""); // Reset form safely
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to link AI")
    });

    const { mutate: updateNote, isPending: isUpdatingNote } = useMutation({
        mutationFn: updateRomanticNote,
        onSuccess: () => {
            toast.success("Note left for your partner! ❤️");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to save note"),
    });

    const { mutate: sendRequest, isPending: isSending } = useMutation({
        mutationFn: sendCoupleRequest,
        onSuccess: () => {
            toast.success("Couple request sent! 💕");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to send request"),
    });

    const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
        mutationFn: acceptCoupleRequest,
        onSuccess: () => {
            toast.success("You're now a couple! 💑");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to accept"),
    });

    const { mutate: doUnlink, isPending: isUnlinking } = useMutation({
        mutationFn: unlinkCouple,
        onSuccess: () => {
            toast.success("Couple unlinked");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to unlink"),
    });

    // Wrapped stable callback passing references down
    const onSaveNote = useCallback((note) => updateNote(note), [updateNote]);


    // ================== EARLY CONDITIONAL RENDERS ==================
    if (coupleLoading || memberLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // Age Gate
    if (userAge < 14 && memberData?.role !== "admin") {
        return <AgeRestrictedView />;
    }

    // Premium Gate
    if (!isPremiumUser(authUser)) {
        return <PremiumRequiredView />;
    }

    // ================== MAIN RENDER ==================
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-24 sm:pb-8 relative">
            <HeartParticles />

            <CoupleHero 
                streakCount={streakCount} 
                showStreakBanner={coupleStatus === "coupled"} 
            />

            <div className="space-y-6">
                
                {/* Global Dashboard Views (Displayed Regardless of Status) */}
                <CoupleMoodHarmony 
                    authUser={authUser} 
                    partnerData={insightData?.partner} 
                    onUpdateMood={handleUpdateMood} 
                    isUpdatingMood={isUpdatingMood} 
                />

                <CoupleSacredRitual 
                    insightData={insightData} 
                    authUser={authUser} 
                    partnerId={partner?._id} 
                />

                <CoupleWallet authUser={authUser} />

                <CoupleVerification 
                    isVerified={authUser?.isVerified} 
                    onBuyVerification={handleBuyVerification} 
                    isBuying={isBuyingVerification} 
                />


                {/* ===== COUPLED STATE ===== */}
                {coupleStatus === "coupled" && partner && (
                    <>
                        {/* 1. Romantic Note Form/Card */}
                        <CoupleRomanticNote 
                            romanticNote={romanticNote} 
                            romanticNoteLastUpdated={romanticNoteLastUpdated} 
                            onSaveNote={onSaveNote} 
                            isUpdatngNote={isUpdatingNote} 
                        />

                        {/* 2. Partner Display Card + Soul Journey */}
                        <CouplePartnerCard 
                            authUser={authUser} 
                            partner={partner} 
                            coupleData={coupleData} 
                            onRenameAI={() => setIsLinkingAI(!isLinkingAI)}
                        />

                        {/* 3. Games & Unlink logic */}
                        <CoupleActivities 
                            isBothAdult={isBothAdult} 
                            onUnlink={doUnlink} 
                            isUnlinking={isUnlinking} 
                        />
                    </>
                )}


                {/* ===== PENDING STATE ===== */}
                {coupleStatus === "pending" && (
                    <PendingCoupleView 
                        partner={partner} 
                        iReceivedRequest={iReceivedRequest} 
                        onAccept={acceptRequest} 
                        isAccepting={isAccepting} 
                        onUnlink={doUnlink} 
                    />
                )}


                {/* ===== SINGLE STATE ===== */}
                {(coupleStatus === "none" || !coupleStatus) && (
                    <SingleView 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        filteredFriends={filteredFriends} 
                        customAiName={customAiName} 
                        setCustomAiName={setCustomAiName} 
                        isLinkingAI={isLinkingAI} 
                        setIsLinkingAI={setIsLinkingAI} 
                        onLinkAI={handleLinkAI} 
                        linkingAIPending={linkingAI} 
                        onSendRequest={sendRequest} 
                        isSendingRequest={isSending} 
                    />
                )}

            </div>
        </div>
    );
};

export default CoupleProfilePage;
