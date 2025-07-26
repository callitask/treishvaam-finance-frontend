import React from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
} from 'react-share';
import {
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    WhatsappIcon,
} from 'react-share';
import { FaCopy } from 'react-icons/fa';

const ShareButtons = ({ url, title, summary }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="flex items-center space-x-4 mt-8">
            <span className="font-bold text-gray-700">Share this post:</span>
            <TwitterShareButton url={url} title={title}>
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <FacebookShareButton url={url} quote={summary}>
                <FacebookIcon size={32} round />
            </FacebookShareButton>
            <LinkedinShareButton url={url} title={title} summary={summary}>
                <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <WhatsappShareButton url={url} title={title} separator=":: ">
                <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <button
                onClick={handleCopy}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                aria-label="Copy link"
            >
                <FaCopy className="text-gray-600" />
            </button>
        </div>
    );
};

export default ShareButtons;
