"use client";
/**
 * AI-CONTEXT:
 * Purpose: Universal Shim for React Router DOM.
 * Scope: Intercepts all legacy `react-router-dom` imports and routes them through Next.js App Router.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Phase 4 Migration alias shim.
 * - EDITED: Added `useSearchParams` polyfill matching the React Router v6 Tuple API `[searchParams, setSearchParams]`.
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
    return {
        pathname: pathname || '/',
        search: searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '',
        hash: '',
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