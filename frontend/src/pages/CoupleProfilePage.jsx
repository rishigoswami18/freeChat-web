import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
    getCoupleStatus,
    sendCoupleRequest,
    acceptCoupleRequest,
    unlinkCouple,
    getFriends,
    getMembershipStatus,
    updateRomanticNote,
} from "../lib/api";
import {
    Heart,
    HeartOff,
    Loader2,
    Search,
    CalendarHeart,
    User,
    HeartHandshake,
    Clock,
    Crown,
    Lock,
    Gamepad2,
    ArrowRight,
    MessageHeart,
    PenLine,
    Sparkles,
    Waves,
} from "lucide-react";
import toast from "react-hot-toast";
import { isPremiumUser } from "../lib/premium";

const CoupleProfilePage = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");

    // Fetch couple status
    const { data: coupleData, isLoading: coupleLoading } = useQuery({
        queryKey: ["coupleStatus"],
        queryFn: getCoupleStatus,
    });

    // Update note draft when data is fetched
    useEffect(() => {
        if (coupleData?.romanticNote && !isEditingNote) {
            setNoteDraft(coupleData.romanticNote);
        }
    }, [coupleData, isEditingNote]);

    // Fetch friends list (for sending couple requests)
    const { data: friends = [] } = useQuery({
        queryKey: ["friends"],
        queryFn: getFriends,
    });

    // Check membership
    const { data: memberData, isLoading: memberLoading } = useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
    });

    // Update Romantic Note
    const { mutate: updateNote, isPending: isUpdatingNote } = useMutation({
        mutationFn: updateRomanticNote,
        onSuccess: () => {
            toast.success("Note left for your partner! ❤️");
            setIsEditingNote(false);
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to save note"),
    });

    // Send couple request
    const { mutate: sendRequest, isPending: isSending } = useMutation({
        mutationFn: sendCoupleRequest,
        onSuccess: () => {
            toast.success("Couple request sent! 💕");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to send request"),
    });

    // Accept couple request
    const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
        mutationFn: acceptCoupleRequest,
        onSuccess: () => {
            toast.success("You're now a couple! 💑");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to accept"),
    });

    // Unlink couple
    const { mutate: doUnlink, isPending: isUnlinking } = useMutation({
        mutationFn: unlinkCouple,
        onSuccess: () => {
            toast.success("Couple unlinked");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to unlink"),
    });

    if (coupleLoading || memberLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

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

    const userAge = calculateAge(authUser?.dateOfBirth);

    // Age gate (Admins are exempt)
    if (userAge < 14 && memberData?.role !== "admin") {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <HeartHandshake className="text-pink-500" />
                    Couple Profile
                </h1>
                <div className="card bg-base-200 border border-error/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-2">
                            <Lock className="size-8 text-error opacity-50" />
                        </div>
                        <h2 className="text-lg font-bold">Age Restricted</h2>
                        <p className="text-sm opacity-60 max-w-xs">
                            The Couple Profile feature is only available for users aged 14 and above.
                        </p>
                        <Link
                            to="/profile"
                            className="alert alert-warning mt-4 text-xs font-semibold py-2 hover:bg-warning/80 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <span className="flex items-center gap-1.5">
                                🔞 Age Verification Required
                                <ArrowRight className="size-3" />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Membership gate (bypassed during free trial)
    if (!isPremiumUser(authUser)) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <HeartHandshake className="text-pink-500" />
                    Couple Profile
                </h1>
                <div className="card bg-base-200 border border-amber-500/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-2">
                            <Lock className="size-8 opacity-40" />
                        </div>
                        <h2 className="text-lg font-bold">Premium Feature</h2>
                        <p className="text-sm opacity-60 max-w-xs">
                            Couple Profiles is a premium feature. Subscribe to freeChat Premium to link your profile with your partner.
                        </p>
                        <Link to="/membership" className="btn btn-primary gap-2 mt-4">
                            <Crown className="size-4" />
                            Subscribe — ₹49/month
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { coupleStatus, partner, anniversary, coupleRequestSenderId, romanticNote, romanticNoteLastUpdated, isBothAdult } = coupleData || {};

    // Calculate days together
    const getDaysTogether = () => {
        if (!anniversary) return 0;
        return Math.floor((Date.now() - new Date(anniversary)) / (1000 * 60 * 60 * 24));
    };

    const handleOpenEditNote = () => {
        setNoteDraft(romanticNote || "");
        setIsEditingNote(true);
    };

    const handleSaveNote = () => {
        updateNote(noteDraft);
    };

    // Who initiated the request? If partnerId sent to me, I need to accept
    const iReceivedRequest =
        coupleStatus === "pending" && partner && coupleRequestSenderId && coupleRequestSenderId !== authUser._id;

    const filteredFriends = friends.filter((f) =>
        f.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-24 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                <HeartHandshake className="text-pink-500" />
                Couple Profile
            </h1>

            {/* ===== COUPLED STATE ===== */}
            {coupleStatus === "coupled" && partner && (
                <div className="space-y-6">
                    <div className="card bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 shadow-xl overflow-hidden rounded-3xl">
                        <div className="card-body items-center text-center p-6 sm:p-8">
                            {/* Partner avatars */}
                            <div className="flex items-center gap-3 sm:gap-6 mb-4">
                                <div className="avatar">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 overflow-hidden shadow-2xl">
                                        <img src={authUser?.profilePic || "/avatar.png"} alt="You" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Heart className="size-6 sm:size-10 text-pink-500 fill-pink-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 opacity-60 mt-1">Linked</span>
                                </div>
                                <div className="avatar">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 overflow-hidden shadow-2xl">
                                        <img src={partner.profilePic || "/avatar.png"} alt={partner.fullName} />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black italic tracking-tight">
                                {authUser?.fullName.split(' ')[0]} & {partner.fullName.split(' ')[0]}
                            </h2>

                            {partner.bio && (
                                <p className="text-xs sm:text-sm opacity-60 max-w-xs mt-1 line-clamp-2 italic">"{partner.bio}"</p>
                            )}

                            {/* Anniversary */}
                            <div className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full flex flex-col items-center gap-1 shadow-inner">
                                <div className="flex items-center gap-2 text-pink-400">
                                    <CalendarHeart className="size-5" />
                                    <span className="text-xs sm:text-sm font-black uppercase tracking-tighter">OUR JOURNEY</span>
                                </div>
                                <p className="text-sm sm:text-base font-bold">
                                    {getDaysTogether()} Days of Togetherness
                                </p>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                                    Since {new Date(anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Romantic Note Section */}
                    <div className="card bg-base-200 border border-pink-500/10 shadow-lg overflow-hidden group rounded-3xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Sparkles className="size-16 text-pink-500" />
                        </div>
                        <div className="card-body p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/20 rounded-xl text-pink-500 shadow-lg shadow-pink-500/10">
                                        <MessageHeart className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Love Note</h3>
                                        <p className="text-[9px] opacity-40 font-bold uppercase tracking-tight">Visible to both of you</p>
                                    </div>
                                </div>
                                {!isEditingNote && (
                                    <button
                                        onClick={handleOpenEditNote}
                                        className="btn btn-ghost btn-sm text-pink-500 gap-1.5 hover:bg-pink-500/10 rounded-xl active:scale-95 transition-all"
                                    >
                                        <PenLine className="size-3.5" />
                                        <span className="text-xs font-bold uppercase">{romanticNote ? "Update" : "Write"}</span>
                                    </button>
                                )}
                            </div>

                            {isEditingNote ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <textarea
                                        className="textarea textarea-bordered w-full bg-base-100 focus:border-pink-500 text-base min-h-[120px] rounded-2xl resize-none italic font-serif p-4"
                                        placeholder="Write something romantic for your partner... ❤️"
                                        value={noteDraft}
                                        onChange={(e) => setNoteDraft(e.target.value)}
                                        maxLength={500}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsEditingNote(false)}
                                            className="btn btn-ghost btn-sm text-xs font-bold uppercase rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNote}
                                            disabled={isUpdatingNote}
                                            className="btn btn-primary btn-sm px-6 rounded-xl shadow-lg shadow-primary/20 gap-2 active:scale-95"
                                        >
                                            {isUpdatingNote ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4 fill-current" />}
                                            <span className="font-bold uppercase tracking-tight">Leave Note</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    {romanticNote ? (
                                        <div className="p-6 bg-gradient-to-br from-pink-500/5 to-red-500/5 rounded-2xl border border-pink-500/10 italic text-center relative overflow-hidden">
                                            <div className="absolute -left-2 -top-2 opacity-5 scale-150 rotate-12">❤️</div>
                                            <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 -rotate-12 font-serif text-6xl">”</div>

                                            <p className="text-lg sm:text-xl font-medium leading-relaxed font-serif text-base-content/90 relative z-10">
                                                "{romanticNote}"
                                            </p>

                                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] opacity-40 uppercase font-black tracking-widest pt-4 border-t border-pink-500/10">
                                                <Clock className="size-3" />
                                                Last updated {new Date(romanticNoteLastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center opacity-40 italic flex flex-col items-center gap-3">
                                            <div className="p-4 bg-base-100 rounded-full">
                                                <Waves className="size-10 text-pink-500/50" />
                                            </div>
                                            <p className="text-sm font-medium">Your shared space for sweet messages is empty.</p>
                                            <button onClick={handleOpenEditNote} className="btn btn-link btn-xs text-pink-500 decoration-pink-500/30 font-bold uppercase tracking-widest mt-2">Write First Note</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Games Section */}
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest">FUN & GAMES</h3>
                            </div>
                            {isBothAdult && (
                                <span className="badge badge-error badge-sm gap-1.5 font-black uppercase text-[9px] animate-pulse rounded-lg bg-red-500 border-none text-white px-2">
                                    🔞 18+ UNLOCKED
                                </span>
                            )}
                        </div>
                        <Link to="/games" className="card bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group rounded-3xl overflow-hidden shadow-sm">
                            <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Gamepad2 className="size-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-primary italic uppercase tracking-tighter text-lg">Couple Games</h4>
                                    <p className="text-xs opacity-60 truncate">
                                        {isBothAdult
                                            ? "Spicy Truth or Dare and more unlocked! 🔥"
                                            : "Play Compatibility Quiz and more!"}
                                    </p>
                                </div>
                                <ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>
                        </Link>
                    </div>

                    {/* Unlink Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to unlink? This will reset your anniversary and couple status.")) {
                                    doUnlink();
                                }
                            }}
                            disabled={isUnlinking}
                            className="btn btn-ghost btn-xs text-error/40 hover:text-error hover:bg-error/10 gap-2 transition-all font-bold uppercase tracking-tighter"
                        >
                            {isUnlinking ? <Loader2 className="size-3 animate-spin" /> : <HeartOff className="size-3" />}
                            Unlink Partner
                        </button>
                    </div>
                </div>
            )}

            {/* ===== PENDING STATE ===== */}
            {coupleStatus === "pending" && partner && (
                <div className="card bg-base-200 shadow-md rounded-3xl overflow-hidden border border-warning/10">
                    <div className="card-body items-center text-center p-8">
                        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                            <Clock className="size-8 text-warning animate-spin-slow" />
                        </div>
                        <h2 className="text-xl font-black italic tracking-tight mb-2 uppercase">Request Pending</h2>
                        <p className="text-xs opacity-60 mb-6">Waiting for relationship verification</p>

                        <div className="flex items-center gap-3 p-4 bg-base-100 rounded-2xl border border-base-300 w-full mb-6">
                            <div className="avatar">
                                <div className="size-12 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 overflow-hidden">
                                    <img src={partner.profilePic || "/avatar.png"} alt={partner.fullName} />
                                </div>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-black text-sm truncate uppercase italic">{partner.fullName}</p>
                                <p className="text-[10px] opacity-40 font-bold">PROSPECTIVE PARTNER</p>
                            </div>
                        </div>

                        {iReceivedRequest ? (
                            <div className="flex flex-col w-full gap-2">
                                <button
                                    onClick={() => acceptRequest(partner._id)}
                                    disabled={isAccepting}
                                    className="btn btn-primary rounded-xl gap-2 h-12 shadow-lg shadow-primary/20 font-bold uppercase tracking-tight active:scale-95"
                                >
                                    {isAccepting ? <Loader2 className="size-5 animate-spin" /> : <Heart className="size-5 fill-current" />}
                                    Accept Request
                                </button>
                                <button
                                    onClick={() => doUnlink()}
                                    disabled={isUnlinking}
                                    className="btn btn-ghost text-error btn-sm font-bold uppercase tracking-widest mt-2"
                                >
                                    Decline
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-info/5 rounded-2xl border border-info/10 text-xs font-bold text-info italic">
                                Waiting for {partner.fullName.split(' ')[0]} to accept...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== SINGLE STATE ===== */}
            {(coupleStatus === "none" || !coupleStatus) && (
                <div className="space-y-6">
                    <div className="card bg-base-200 shadow-xl rounded-3xl border border-base-300 overflow-hidden relative group">
                        <div className="absolute -right-8 -bottom-8 opacity-5 font-serif text-[120px] group-hover:scale-110 transition-transform duration-500">❤️</div>
                        <div className="card-body items-center text-center p-8 sm:p-12 relative z-10">
                            <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-pink-500/5">
                                <Heart className="size-10 text-pink-500 fill-pink-500/50" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase mb-2">Find Your Partner</h2>
                            <p className="text-sm opacity-60 max-w-xs mb-8">
                                Link profiles with your special someone to unlock shared memories, love notes, and couple games.
                            </p>

                            {/* Search Friends Search Bar */}
                            <div className="form-control w-full relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                                <input
                                    type="text"
                                    placeholder="Search your friends..."
                                    className="input input-bordered w-full pl-12 h-14 rounded-2xl bg-base-100 focus:border-primary shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Friends Selection List */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest px-1">FRIENDS LIST</h3>
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2 pr-1 overscroll-contain">
                            {filteredFriends.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-base-200/50 rounded-3xl border border-dashed border-base-300">
                                    <p className="text-sm opacity-50 font-bold uppercase italic tabular-nums tracking-widest">
                                        {friends.length === 0
                                            ? "Add friends to begin"
                                            : "No matches found"}
                                    </p>
                                </div>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend._id}
                                        className="flex items-center justify-between p-4 bg-base-200 rounded-2xl hover:bg-base-200/80 transition-all border border-transparent hover:border-primary/10 shadow-sm group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="size-11 rounded-full ring-2 ring-base-300 overflow-hidden bg-base-300">
                                                    {friend.profilePic ? (
                                                        <img src={friend.profilePic} alt={friend.fullName} className="object-cover size-full" />
                                                    ) : (
                                                        <div className="size-full flex items-center justify-center">
                                                            <User className="size-5 opacity-30" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase italic tracking-tight group-hover:text-primary transition-colors">{friend.fullName}</p>
                                                <p className="text-[10px] opacity-40 font-bold uppercase">@{friend.username || 'user'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendRequest(friend._id)}
                                            disabled={isSending}
                                            className="btn btn-primary btn-sm px-5 rounded-xl h-10 shadow-lg shadow-primary/10 font-bold uppercase tracking-tight text-xs active:scale-95 transition-all"
                                        >
                                            {isSending ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Heart className="size-4 fill-current mr-1.5" />
                                            )}
                                            {isSending ? "" : "Link"}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Games Reveal Preview */}
                    <div className="mt-12 opacity-80 group">
                        <div className="flex items-center gap-2 mb-4 text-primary font-black italic tracking-tighter">
                            <Gamepad2 className="size-5" />
                            <h3 className="text-sm uppercase tracking-widest">Premium Games Dashboard</h3>
                        </div>
                        <div className="card bg-base-300/30 border border-base-300 relative overflow-hidden h-36 flex items-center justify-center text-center p-8 rounded-3xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                            <div className="relative z-10">
                                <p className="text-base font-black mb-1 italic text-primary uppercase tracking-tighter">Togetherness Awaits! 🎮</p>
                                <p className="text-xs opacity-60">Compatibility quizzes, spicy challenges, and more once you're coupled.</p>
                                <Link to="/games" className="btn btn-ghost btn-xs mt-4 text-primary gap-1.5 font-bold uppercase tracking-widest hover:bg-primary/10 rounded-lg">
                                    Explore Games <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoupleProfilePage;
