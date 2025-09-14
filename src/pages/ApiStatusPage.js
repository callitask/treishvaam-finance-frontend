import React from 'react';
import ApiStatusPanel from '../components/ApiStatusPanel';

const ApiStatusPage = () => {
    return (
        <div className="container mx-auto p-6 md:p-8">
            <ApiStatusPanel showHistory={true} />
        </div>
    );
};

export default ApiStatusPage;