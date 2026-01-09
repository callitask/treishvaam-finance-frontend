import React, { useEffect } from 'react';

const AdSenseWidget = ({ slotId, style = {}, format = "auto", responsive = "true" }) => {
    useEffect(() => {
        try {
            // Push the ad to Google's queue
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, []);

    return (
        <div className="adsense-container my-8 text-center bg-gray-50 border border-gray-100 p-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Advertisement</span>
            <ins className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID_HERE"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive}>
            </ins>
        </div>
    );
};

export default AdSenseWidget;