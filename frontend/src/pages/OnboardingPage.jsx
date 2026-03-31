import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { Trophy, User, MapPin, ChevronRight, CheckCircle, Zap } from "lucide-react";
import Logo from "../components/Logo";

const STATE_CITY_DATA = {
  "Punjab": ["Jalandhar", "Ludhiana", "Amritsar", "Patiala", "Mohali"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut"],
  "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Howrah"],
};

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(2);
  
  const [formState, setFormState] = useState(() => {
    const saved = localStorage.getItem("Zyro_onboarding_draft");
    const defaultData = {
      fullName: authUser?.fullName || "",
      gender: "NONE",
      state: "",
      city: "",
      bio: "I'm ready to dominate!",
      nativeLanguage: "hindi",
      learningLanguage: "english",
      location: "",
    };
    return saved ? JSON.parse(saved) : defaultData;
  });

  // Persist draft to local storage
  useMemo(() => {
    localStorage.setItem("Zyro_onboarding_draft", JSON.stringify(formState));
  }, [formState]);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      localStorage.removeItem("Zyro_onboarding_draft");
      toast.success("Welcome to the Arena! 🏟️ +500 Coins added!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.city || !formState.gender) return toast.error("Please fill all details!");
    onboardingMutation(formState);
  };

  const progress = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-[#0a0c14] text-white flex flex-col font-outfit overflow-hidden relative">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="space-y-10 bg-white/5 border border-white/10 backdrop-blur-3xl p-10 lg:p-16 rounded-[48px]"
              >
                <div className="space-y-2">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase">Soldier Intel 📋</h2>
                  <p className="text-white/40 uppercase tracking-widest text-xs font-bold font-outfit">Define your identity in the Arena</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* GENDER SELECT */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Gender Identity</label>
                      <div className="flex gap-2">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <motion.button
                            type="button"
                            key={g}
                            whileTap={{ scale: 0.9 }}
                            animate={{ 
                              scale: formState.gender === g ? 1.05 : 1,
                              borderColor: formState.gender === g ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.1)"
                            }}
                            onClick={() => setFormState({ ...formState, gender: g })}
                            className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase transition-all border ${
                              formState.gender === g 
                              ? "bg-primary text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                              : "bg-white/5 text-white/40"
                            }`}
                          >
                            {g}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* FULL NAME */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Warrior Display Name</label>
                      <input 
                        type="text" 
                        value={formState.fullName}
                        onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 focus:border-primary transition-all font-bold outline-none"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* STATE SELECT */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Home State</label>
                      <select 
                        value={formState.state}
                        onChange={(e) => setFormState({ ...formState, state: e.target.value, city: "" })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 focus:border-primary transition-all font-bold outline-none appearance-none"
                      >
                        <option value="" className="bg-black">Select State</option>
                        {Object.keys(STATE_CITY_DATA).map(s => (
                          <option key={s} value={s} className="bg-black">{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* CITY SELECT */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Battleground City</label>
                      <select 
                        disabled={!formState.state}
                        value={formState.city}
                        onChange={(e) => setFormState({ ...formState, city: e.target.value, location: `${formState.city}, ${formState.state}` })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 focus:border-primary transition-all font-bold outline-none appearance-none disabled:opacity-20"
                      >
                        <option value="" className="bg-black">Select City</option>
                        {formState.state && STATE_CITY_DATA[formState.state].map(c => (
                          <option key={c} value={c} className="bg-black">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="w-full">
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-2xl"
                    >
                      {isPending ? "Syncing..." : <>Enter the Arena <Zap className="size-5 fill-white" /></>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Rewards Badge */}
      <div className="p-10 flex justify-center">
        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full border border-white/10">
          <Zap className="size-4 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Complete to Earn 500 Bond Coins</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
