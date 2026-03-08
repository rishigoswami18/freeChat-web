import { useEffect } from 'react';
import useAuthUser from '../hooks/useAuthUser';

const AdSense = ({ slot, style = { display: 'block' }, format = 'auto', responsive = 'true' }) => {
    const { authUser } = useAuthUser();

    useEffect(() => {
        // Only trigger if ads are NOT disabled (non-members)
        if (!authUser?.isMember) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('AdSense error:', e);
            }
        }
    }, [authUser?.isMember]);

    // HIDE ADS FOR PREMIUM MEMBERS
    if (authUser?.isMember) return null;

    return (
        <div className="adsense-container w-full overflow-hidden flex justify-center py-4">
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client="ca-pub-4421164590159929"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
};

export default AdSense;
