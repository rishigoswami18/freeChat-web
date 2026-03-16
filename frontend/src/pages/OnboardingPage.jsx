import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { Trophy, User, MapPin, ChevronRight, CheckCircle, Zap } from "lucide-react";
import Logo from "../components/Logo";

const IPL_TEAMS = [
  { id: "CSK", name: "Chennai Super Kings", color: "#FDB913", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CHH/Logos/LogoLight/CSK.png" },
  { id: "RCB", name: "Royal Challengers Bengaluru", color: "#D11D26", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/LogoLight/RCB.png" },
  { id: "MI", name: "Mumbai Indians", color: "#004BA0", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/LogoLight/MI.png" },
  { id: "GT", name: "Gujarat Titans", color: "#1B2133", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/LogoLight/GT.png" },
  { id: "LSG", name: "Lucknow Super Giants", color: "#0057E2", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/LogoLight/LSG.png" },
  { id: "RR", name: "Rajasthan Royals", color: "#EA1A85", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/LogoLight/RR.png" },
  { id: "DC", name: "Delhi Capitals", color: "#0078BC", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/LogoLight/DC.png" },
  { id: "PBKS", name: "Punjab Kings", color: "#D31D24", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/LogoLight/PBKS.png" },
  { id: "KKR", name: "Kolkata Knight Riders", color: "#3A225D", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/LogoLight/KKR.png" },
  { id: "SRH", name: "Sunrisers Hyderabad", color: "#FF822A", logo: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/LogoLight/SRH.png" },
];

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
  const [step, setStep] = useState(1);
  
  const [formState, setFormState] = useState(() => {
    const saved = localStorage.getItem("bondbeyond_onboarding_draft");
    const defaultData = {
      fullName: authUser?.fullName || "",
      favTeam: "NONE",
      gender: "NONE",
      state: "",
      city: "",
      bio: "I'm a die-hard IPL fan!",
      nativeLanguage: "hindi",
      learningLanguage: "english",
      location: "",
    };
    return saved ? JSON.parse(saved) : defaultData;
  });

  // Persist draft to local storage
  useMemo(() => {
    localStorage.setItem("bondbeyond_onboarding_draft", JSON.stringify(formState));
  }, [formState]);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      localStorage.removeItem("bondbeyond_onboarding_draft");
      toast.success("Welcome to the Arena! 🏟️ +500 Coins added!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const updateTheme = (color) => {
    document.documentElement.style.setProperty("--primary-color", color);
  };

  const handleTeamSelect = (teamId, color) => {
    setFormState({ ...formState, favTeam: teamId });
    updateTheme(color);
    setTimeout(() => setStep(2), 600);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.city || !formState.gender) return toast.error("Please fill all details!");
    onboardingMutation(formState);
  };

  const progress = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-[#0a0c14] text-white flex flex-col font-outfit overflow-hidden relative">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Cricket Pitch Progress Bar */}
      <div className="w-full h-3 bg-[#13331d] relative overflow-hidden">
        {/* Pitch markings */}
        <div className="absolute inset-0 flex justify-between px-12 pointer-events-none opacity-40">
          <div className="h-full w-1 bg-white" />
          <div className="h-full w-1 bg-white" />
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-white" />
        </div>
        
        {/* Grass texture effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-green-900/20" />

        <motion.div 
          className="h-full bg-primary relative shadow-[0_0_30px_rgba(34,197,94,0.3)]" 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        >
          <motion.div 
            className="absolute -right-6 -top-5 text-3xl filter drop-shadow-lg"
            animate={{ 
              x: [0, 4, 0],
              y: [0, -2, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
          >
            🏏
          </motion.div>
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-5xl font-black italic tracking-tighter">PICK YOUR WARRIORS ⚔️</h1>
                  <p className="text-white/40 uppercase tracking-widest text-sm font-bold">Select your favorite IPL team</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {IPL_TEAMS.map((team) => (
                    <motion.button
                      key={team.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTeamSelect(team.id, team.color)}
                      className={`relative aspect-square rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 transition-all border ${
                        formState.favTeam === team.id 
                        ? "bg-primary border-white" 
                        : "bg-white/5 border-white/10 hover:border-white/30 backdrop-blur-xl"
                      }`}
                    >
                      <img src={team.logo} alt={team.id} className="w-full h-full object-contain" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">{team.id}</span>
                      {formState.favTeam === team.id && (
                        <CheckCircle className="absolute top-4 right-4 size-5 text-white" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

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

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-8 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-xs"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="flex-1 h-16 bg-primary text-white rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-2xl"
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