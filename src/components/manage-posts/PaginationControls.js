import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, itemsPerPage, onItemsPerPageChange }) => {
    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-500">
                Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg text-sm py-1.5 px-3 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                </select>

                <div className="flex gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronLeft size={12} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simple logic for windowing pagination can be added here
                        // For now, simple 1-5 or based on total
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === p
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaginationControls;