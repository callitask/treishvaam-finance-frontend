import React from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
    TelegramShareButton, // Added Telegram
} from 'react-share';
import {
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    WhatsappIcon,
    TelegramIcon, // Added Telegram
} from 'react-share';
import { FaCopy } from 'react-icons/fa';

const ShareButtons = ({ url, title, summary }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        // Consider a more subtle notification in the future if desired
        alert('Link copied to clipboard!');
    };

    return (
        <div className="flex flex-wrap items-center gap-4 mt-8">
            <span className="font-bold text-gray-700 text-lg mr-2">Share this article:</span>
            <div className="flex items-center gap-3">
                <TwitterShareButton url={url} title={title}>
                    <TwitterIcon size={40} round />
                </TwitterShareButton>

                <FacebookShareButton url={url} quote={summary}>
                    <FacebookIcon size={40} round />
                </FacebookShareButton>

                <LinkedinShareButton url={url} title={title} summary={summary}>
                    <LinkedinIcon size={40} round />
                </LinkedinShareButton>

                <WhatsappShareButton url={url} title={title} separator=":: ">
                    <WhatsappIcon size={40} round />
                </WhatsappShareButton>

                <TelegramShareButton url={url} title={title}>
                    <TelegramIcon size={40} round />
                </TelegramShareButton>

                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                    aria-label="Copy link"
                    title="Copy Link"
                >
                    <FaCopy className="text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default ShareButtons;