/**
 * AI-CONTEXT:
 * Purpose: Pagination controls for data tables.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`, 
 * changed `rounded-lg` to `rounded`, and reduced typography to `text-[11px]` for a high-density feel.
 * Active pagination button converted to `bg-slate-800` instead of bright sky blue.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, itemsPerPage, onItemsPerPageChange }) => {
    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-500">
                Showing <span className="font-bold text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span> results
            </div>
            <div className="flex items-center gap-2">
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="border border-slate-200 rounded text-[11px] py-1 px-2 bg-slate-50 focus:ring-1 focus:ring-sky-500 outline-none text-slate-700"
                >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                </select>

                <div className="flex gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                    >
                        <FaChevronLeft size={10} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold transition-colors ${currentPage === p
                                    ? 'bg-slate-800 text-white shadow-sm border border-slate-800'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                    >
                        <FaChevronRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaginationControls;