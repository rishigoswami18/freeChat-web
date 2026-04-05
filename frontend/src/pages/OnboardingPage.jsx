import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { MapPin, ChevronRight, Zap, ArrowRight, Sparkles } from "lucide-react";
import Logo from "../components/Logo";

const STATE_CITY_DATA = {
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali", "Bathinda"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy", "Tiruppur"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Prayagraj", "Ghaziabad"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
};

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(2);
  
  const [formState, setFormState] = useState(() => {
    const saved = localStorage.getItem("fc_onboarding_draft");
    const defaultData = {
      fullName: authUser?.fullName || "",
      gender: "NONE",
      state: "",
      city: "",
      bio: "Hey there! I'm new here 👋",
      nativeLanguage: "hindi",
      learningLanguage: "english",
      location: "",
    };
    return saved ? JSON.parse(saved) : defaultData;
  });

  useMemo(() => {
    localStorage.setItem("fc_onboarding_draft", JSON.stringify(formState));
  }, [formState]);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      localStorage.removeItem("fc_onboarding_draft");
      toast.success("Welcome to FreeChat! 🎉 You earned 500 Gems!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.city || !formState.gender) return toast.error("Please fill all required fields");
    onboardingMutation(formState);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden relative">
      {/* Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.06),_transparent_50%)] pointer-events-none" />

      {/* Top Logo */}
      <div className="p-6 sm:p-10 relative z-10">
        <Logo fontSize="text-2xl" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10 bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8 sm:p-12 lg:p-16 rounded-3xl"
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                    <Sparkles size={12} /> Almost there
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Complete your profile</h2>
                  <p className="text-sm text-white/40 font-medium">Tell us a bit about yourself to personalize your experience</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GENDER */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">Gender</label>
                      <div className="flex gap-2">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <motion.button
                            type="button"
                            key={g}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormState({ ...formState, gender: g })}
                            className={`flex-1 py-3.5 rounded-2xl text-xs font-semibold transition-all border ${
                              formState.gender === g 
                              ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" 
                              : "bg-white/[0.03] text-white/40 border-white/5 hover:border-white/10"
                            }`}
                          >
                            {g}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* FULL NAME */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">Display Name</label>
                      <input 
                        type="text" 
                        value={formState.fullName}
                        onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl h-[50px] px-5 focus:border-indigo-500/40 transition-all font-medium outline-none text-sm"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* STATE */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">State</label>
                      <select 
                        value={formState.state}
                        onChange={(e) => setFormState({ ...formState, state: e.target.value, city: "" })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl h-[50px] px-5 focus:border-indigo-500/40 transition-all font-medium outline-none appearance-none text-sm"
                      >
                        <option value="" className="bg-[#0f172a]">Select State</option>
                        {Object.keys(STATE_CITY_DATA).map(s => (
                          <option key={s} value={s} className="bg-[#0f172a]">{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* CITY */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold uppercase text-white/30 tracking-wider ml-1">City</label>
                      <select 
                        disabled={!formState.state}
                        value={formState.city}
                        onChange={(e) => setFormState({ ...formState, city: e.target.value, location: `${e.target.value}, ${formState.state}` })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl h-[50px] px-5 focus:border-indigo-500/40 transition-all font-medium outline-none appearance-none disabled:opacity-20 text-sm"
                      >
                        <option value="" className="bg-[#0f172a]">Select City</option>
                        {formState.state && STATE_CITY_DATA[formState.state].map(c => (
                          <option key={c} value={c} className="bg-[#0f172a]">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <motion.button 
                    type="submit"
                    disabled={isPending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/20 transition-all text-sm"
                  >
                    {isPending ? "Setting up..." : <>Get Started <ArrowRight size={16} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reward Badge */}
      <div className="p-8 flex justify-center relative z-10">
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-amber-500/10 rounded-full border border-amber-500/15">
          <Zap className="size-4 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-semibold text-amber-400">Complete to earn 500 Gems</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
