"use client";
/**
 * AI-CONTEXT:
 * Purpose: Universal Shim for React Router DOM.
 * Scope: Intercepts all legacy `react-router-dom` imports and routes them through Next.js App Router.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Phase 4 Migration alias shim.
 * - EDITED: Added `useSearchParams` polyfill matching the React Router v6 Tuple API `[searchParams, setSearchParams]`.
 * - EDITED (Vol 2 - Hydration Mismatch Resolution):
 * • ROOT CAUSE: Inline evaluation of `window.location.hash` during render created an SSR/CSR HTML attribute mismatch on NavLink components, triggering React Hydration Error #423 and forcing React to unmount/remount the client DOM tree.
 * • FIX: Deferred `hash` state population to a post-mount `useEffect` hook, guaranteeing 100% byte-for-byte SSR/CSR hydration parity.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useParams as useNextParams, useSearchParams as useNextSearchParams } from 'next/navigation';

export const useNavigate = () => {
    const router = useRouter();
    return (path, options) => {
        if (typeof path === 'number') {
            if (path === -1) router.back();
            return;
        }
        if (path) router.push(path);
    };
};

export const useLocation = () => {
    const pathname = usePathname();
    const searchParams = useNextSearchParams();
    const [hash, setHash] = React.useState('');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setHash(window.location.hash || '');
        }
    }, []);

    return {
        pathname: pathname || '/',
        search: searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '',
        hash: hash,
        state: null
    };
};

export const useParams = () => {
    return useNextParams() || {};
};

// Next.js returns a read-only URLSearchParams object. React Router returns an array tuple.
// We must polyfill the array tuple to prevent destructuring crashes.
export const useSearchParams = () => {
    const searchParams = useNextSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const setSearchParams = (params) => {
        const newParams = new URLSearchParams(params);
        router.push(`${pathname}?${newParams.toString()}`);
    };

    return [searchParams, setSearchParams];
};

export const Link = ({ to, children, className, ...props }) => {
    const href = to || '#';
    return <NextLink href={href} className={className} {...props}>{children}</NextLink>;
};

export const NavLink = ({ to, children, className, activeClassName, ...props }) => {
    const pathname = usePathname();
    const href = to || '#';
    const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));
    const combinedClassName = `${className || ''} ${isActive ? (activeClassName || 'active') : ''}`.trim();
    return <NextLink href={href} className={combinedClassName} {...props}>{children}</NextLink>;
};

export const Navigate = ({ to, replace }) => {
    const router = useRouter();
    React.useEffect(() => {
        if (to) {
            if (replace) router.replace(to);
            else router.push(to);
        }
    }, [to, replace, router]);
    return null;
};