import { createContext, useEffect, useState } from "react";

export const FetchContext = createContext();

export function FetchProvider({ children }) {
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 5;
    const retryDelay = 3000;

    const fetchWithRetry = async (url, options = {}) => {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const res = await fetch(url, options);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setRetryCount(0);
                return data;
            } catch (error) {
                console.error('Fetch failed:', error);
                attempt++;
                setRetryCount(attempt);
                if (attempt >= maxRetries) {
                    throw new Error('Maximum retry attempts reached');
                }

                await new Promise(resolve => setTimeout(resolve, retryDelay));
            };
        };
    };

    return (
        <FetchContext.Provider value={{ fetchWithRetry }}>
            {children}
        </FetchContext.Provider>
    );
};