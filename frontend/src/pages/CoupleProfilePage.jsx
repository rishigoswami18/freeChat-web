import { useState, useEffect } from "react";
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
                        <Lock className="size-8 text-error opacity-50 mb-2" />
                        <h2 className="text-lg font-bold">Age Restricted</h2>
                        <p className="text-sm opacity-60">
                            Available for users aged 14 and above.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Membership gate
    if (!isPremiumUser(authUser)) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <HeartHandshake className="text-pink-500" />
                    Couple Profile
                </h1>
                <div className="card bg-base-200 border border-amber-500/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        <Crown className="size-8 text-amber-500 mb-2" />
                        <h2 className="text-lg font-bold">Premium Feature</h2>
                        <p className="text-sm opacity-60">Subscribe to link with your partner.</p>
                        <Link to="/membership" className="btn btn-primary mt-4">Subscribe — ₹49/month</Link>
                    </div>
                </div>
            </div>
        );
    }

    const { coupleStatus, partner, anniversary, coupleRequestSenderId, romanticNote, romanticNoteLastUpdated, isBothAdult } = coupleData || {};

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

    const iReceivedRequest =
        coupleStatus === "pending" && partner && coupleRequestSenderId && coupleRequestSenderId !== authUser._id;

    const filteredFriends = friends.filter((f) =>
        f.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-24 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                <HeartHandshake className="text-pink-500" />
                Couple Profile
                <span className="text-[10px] bg-primary text-primary-content px-2 py-0.5 rounded-full animate-pulse ml-2 uppercase">v2.4 Final</span>
            </h1>
            <p className="text-[10px] opacity-30 mb-6 uppercase font-black tracking-widest">Shared Love Notes & Dashboard</p>

            <div className="space-y-6">
                {/* ===== COUPLED STATE ===== */}
                {coupleStatus === "coupled" && partner && (
                    <>
                        {/* 1. Romantic Note Section (Top Priority) */}
                        <div className="card bg-base-200 border-2 border-primary shadow-2xl overflow-hidden group rounded-3xl relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                <Sparkles className="size-16 text-primary" />
                            </div>
                            <div className="card-body p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 rounded-xl text-primary shadow-lg shadow-primary/10">
                                            <MessageHeart className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Romantic Note</h3>
                                            <p className="text-[9px] opacity-40 font-bold uppercase tracking-tight">Your shared message space</p>
                                        </div>
                                    </div>
                                    {!isEditingNote && (
                                        <button
                                            onClick={handleOpenEditNote}
                                            className="btn btn-ghost btn-sm text-primary gap-1.5 hover:bg-primary/10 rounded-xl active:scale-95 transition-all outline-none"
                                        >
                                            <PenLine className="size-3.5" />
                                            <span className="text-xs font-bold uppercase">{romanticNote ? "Update" : "Write"}</span>
                                        </button>
                                    )}
                                </div>

                                {isEditingNote ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <textarea
                                            className="textarea textarea-bordered w-full bg-base-100 focus:border-primary text-base min-h-[140px] rounded-2xl resize-none italic font-serif p-4 shadow-inner"
                                            placeholder="Write something romantic... ❤️"
                                            value={noteDraft}
                                            onChange={(e) => setNoteDraft(e.target.value)}
                                            maxLength={500}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setIsEditingNote(false)} className="btn btn-ghost btn-sm text-xs font-bold uppercase rounded-xl">Cancel</button>
                                            <button onClick={handleSaveNote} disabled={isUpdatingNote} className="btn btn-primary btn-sm px-6 rounded-xl shadow-lg shadow-primary/20 gap-2 active:scale-95">
                                                {isUpdatingNote ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4 fill-current" />}
                                                <span className="font-bold uppercase tracking-tight">Leave Note</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {romanticNote ? (
                                            <div className="p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/10 italic text-center relative overflow-hidden shadow-inner">
                                                <p className="text-xl sm:text-2xl font-medium leading-relaxed font-serif text-base-content relative z-10">"{romanticNote}"</p>
                                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] opacity-40 uppercase font-black tracking-widest pt-4 border-t border-primary/10">
                                                    <Clock className="size-3" />
                                                    Updated {new Date(romanticNoteLastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center opacity-40 italic flex flex-col items-center gap-3 bg-base-300/30 rounded-2xl border border-dashed border-base-content/10">
                                                <Waves className="size-10 text-primary/40" />
                                                <p className="text-sm font-medium">No messages left yet.</p>
                                                <button onClick={handleOpenEditNote} className="btn btn-outline btn-primary btn-sm px-6 rounded-xl uppercase font-black mt-2">Write First Note</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Partner Profile Card */}
                        <div className="card bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 shadow-xl overflow-hidden rounded-3xl">
                            <div className="card-body items-center text-center p-8">
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="avatar">
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 shadow-2xl overflow-hidden">
                                            <img src={authUser?.profilePic || "/avatar.png"} alt="You" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Heart className="size-6 sm:size-10 text-pink-500 fill-pink-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 opacity-60 mt-1">Linked</span>
                                    </div>
                                    <div className="avatar">
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 shadow-2xl overflow-hidden">
                                            <img src={partner.profilePic || "/avatar.png"} alt="" />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase">{authUser?.fullName.split(' ')[0]} & {partner.fullName.split(' ')[0]}</h2>
                                {partner.bio && <p className="text-xs sm:text-sm opacity-60 mt-1 italic">"{partner.bio}"</p>}

                                <div className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full flex flex-col items-center gap-1 shadow-inner">
                                    <div className="flex items-center gap-2 text-pink-400">
                                        <CalendarHeart className="size-5" />
                                        <span className="text-xs font-black uppercase tracking-tighter">OUR JOURNEY</span>
                                    </div>
                                    <p className="text-sm sm:text-base font-bold uppercase">{getDaysTogether()} Days of Togetherness</p>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Since {new Date(anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Games Section */}
                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest">ACTIVITIES</h3>
                                {isBothAdult && <span className="badge badge-error badge-sm uppercase text-[9px] font-black px-2 py-2 rounded-lg">🔞 18+ Access</span>}
                            </div>
                            <Link to="/games" className="card bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group rounded-3xl overflow-hidden shadow-sm">
                                <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white"><Gamepad2 className="size-6" /></div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-primary italic uppercase tracking-tighter text-lg">Couple Games</h4>
                                        <p className="text-xs opacity-60">Play compatibility quizzes and more!</p>
                                    </div>
                                    <ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </Link>
                        </div>

                        {/* 4. Unlink Button */}
                        <div className="flex justify-center pt-8">
                            <button onClick={() => window.confirm("Unlink Partner?") && doUnlink()} disabled={isUnlinking} className="btn btn-ghost btn-xs text-error/30 hover:text-error transition-all font-bold uppercase tracking-tighter">
                                {isUnlinking ? <Loader2 className="size-3 animate-spin" /> : <HeartOff className="size-3" />}
                                Unlink Partner
                            </button>
                        </div>
                    </>
                )}

                {/* ===== PENDING STATE ===== */}
                {coupleStatus === "pending" && partner && (
                    <div className="card bg-base-200 border border-warning/10 rounded-3xl p-8 items-center text-center shadow-xl">
                        <Clock className="size-10 text-warning animate-spin-slow mb-4" />
                        <h2 className="text-xl font-black italic uppercase tracking-tight mb-2">Request Pending</h2>
                        <p className="text-xs opacity-60 mb-6">Waiting for relationship verification</p>
                        <div className="flex items-center gap-3 p-4 bg-base-100 rounded-2xl border border-base-300 w-full mb-6">
                            <img src={partner.profilePic || "/avatar.png"} className="size-12 rounded-full ring-2 ring-primary/20" alt="" />
                            <div className="text-left font-black text-sm uppercase italic">{partner.fullName}</div>
                        </div>
                        {iReceivedRequest ? (
                            <div className="flex flex-col w-full gap-2">
                                <button onClick={() => acceptRequest(partner._id)} disabled={isAccepting} className="btn btn-primary rounded-xl font-bold uppercase">{isAccepting ? <Loader2 className="animate-spin" /> : <Heart className="mr-2 fill-current" />} Accept Request</button>
                                <button onClick={() => doUnlink()} className="btn btn-ghost text-error btn-sm font-black mt-2">Decline</button>
                            </div>
                        ) : (
                            <div className="p-4 bg-info/5 rounded-2xl text-xs font-bold text-info italic">Waiting for response...</div>
                        )}
                    </div>
                )}

                {/* ===== SINGLE STATE ===== */}
                {(coupleStatus === "none" || !coupleStatus) && (
                    <div className="space-y-6">
                        <div className="card bg-base-200 p-12 items-center text-center rounded-3xl border border-base-300 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-8 -bottom-8 opacity-5 text-[120px]">❤️</div>
                            <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner"><Heart className="size-10 text-pink-500 fill-pink-500/50" /></div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Find Your Partner</h2>
                            <p className="text-sm opacity-60 max-w-xs mb-8">Link accounts to unlock shared love notes, anniversary tracking, and couple games.</p>
                            <div className="form-control w-full relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                                <input type="text" placeholder="Search friends..." className="input input-bordered w-full pl-12 h-14 rounded-2xl bg-base-100 focus:border-primary shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest px-1">FRIENDS LIST</h3>
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2">
                                {filteredFriends.length === 0 ? (
                                    <div className="text-center py-12 opacity-40 font-bold uppercase italic tracking-widest">No friends found</div>
                                ) : (
                                    filteredFriends.map((f) => (
                                        <div key={f._id} className="flex items-center justify-between p-4 bg-base-200 rounded-2xl hover:bg-base-300 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <img src={f.profilePic || "/avatar.png"} className="size-11 rounded-full ring-2 ring-base-300" alt="" />
                                                <div><p className="font-black text-sm uppercase italic tracking-tight">{f.fullName}</p><p className="text-[10px] opacity-40 font-bold uppercase">@{f.username || 'user'}</p></div>
                                            </div>
                                            <button onClick={() => sendRequest(f._id)} disabled={isSending} className="btn btn-primary btn-sm px-6 rounded-xl font-bold uppercase text-[10px]">Link</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoupleProfilePage;