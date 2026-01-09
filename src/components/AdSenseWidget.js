import React, { useEffect, useRef } from 'react';

const AdSenseWidget = ({ slotId, style = {}, format = "auto", responsive = "true" }) => {
    const adRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        try {
            // Check if the ad has already been loaded in this container to prevent duplicates in Strict Mode
            if (adRef.current && adRef.current.innerHTML === "") {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            // AdSense throws errors if push() is called on a populated slot.
            // We log this for debugging but suppress it from breaking the UI.
            console.warn("AdSense Warning:", e);
        }

        return () => {
            isMounted = false;
        };
    }, [slotId]);

    return (
        <div className="adsense-container my-8 text-center bg-gray-50 border border-gray-100 p-2 overflow-hidden min-h-[100px] flex flex-col justify-center items-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1 self-start w-full text-left ml-2">Advertisement</span>
            <ins className="adsbygoogle"
                ref={adRef}
                style={{ display: 'block', minWidth: '250px', ...style }}
                data-ad-client="ca-pub-6767594004709750"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive}>
            </ins>
        </div>
    );
};

export default AdSenseWidget;