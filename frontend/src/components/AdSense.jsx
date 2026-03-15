import { useEffect, useRef, memo } from 'react';
import useAuthUser from '../hooks/useAuthUser';

// === DEV WARNINGS ===
const checkProps = (slot) => {
    if (process.env.NODE_ENV !== 'production' && !slot) {
        console.warn('AdSense Component Error: Missing required `slot` prop. Ad will fail to load.');
    }
};

const AdSense = memo(({ 
    slot, 
    style = { display: 'block' }, 
    format = 'auto', 
    responsive = 'true' 
}) => {
    // === AUTH STATE LOGIC ===
    const { authUser } = useAuthUser();
    
    // Abstracting check explicitly to prevent ref re-computation if `authUser` object mutates
    const isPremium = authUser?.isMember || authUser?.role === 'admin';

    // === ADBYGOOGLE LIFECYCLE MANAGEMENT ===
    // Critical protection against React 18 strict mode double-invocations & endless re-renders
    const adInitialized = useRef(false);

    useEffect(() => {
        checkProps(slot);

        // Immediate Abort: Don't inject network bloat for premium users
        if (isPremium) return;

        // Immediate Abort: Don't forcefully push another ad block into an already populated slot
        if (adInitialized.current) return;

        // Secure Ad Push Implementation
        if (typeof window !== 'undefined') {
            try {
                // Instantiate array if script tag hasn't loaded yet,
                // otherwise push execution parameter explicitly.
                const adsbygoogle = window.adsbygoogle || [];
                adsbygoogle.push({});
                
                // Hardware Lock: Flag component entirely preventing React re-renders from pushing duplicated slots
                adInitialized.current = true;
            } catch (e) {
                // Failsafe catch for "adsbygoogle.push() error: No slot size for availableWidth=0"
                console.error('AdSense Initialization Blocked:', e.message);
            }
        }
    }, [isPremium, slot]); // Explicit structural dependencies

    // === RENDER PIPELINE ===
    
    // HIDE ADS FOR PREMIUM MEMBERS (Destroys DOM tree immediately)
    if (isPremium) return null;

    // STABLE AD CONTAINER SHIELD
    // Prevents Layout Shifts (CLS) by isolating the `<ins>` wrapper natively.
    return (
        <div className="adsense-container w-full overflow-hidden flex justify-center py-4 bg-transparent outline-none border-none pointer-events-auto">
            <ins
                className="adsbygoogle w-full relative z-0"
                style={style}
                data-ad-client="ca-pub-4421164590159929"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
});
AdSense.displayName = "AdSense";

export default AdSense;
