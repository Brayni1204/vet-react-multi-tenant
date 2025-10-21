/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // 🎯 Inicializa el tema leyendo de localStorage o usa 'light' por defecto
        const storedTheme = localStorage.getItem('vet-admin-theme') as Theme;
        return storedTheme || 'light';
    });

    useEffect(() => {
        // Aplica la clase 'dark-mode' o 'light-mode' al body del documento
        document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
        // 🎯 Persiste el tema en localStorage
        localStorage.setItem('vet-admin-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
    };

    const value = { theme, toggleTheme };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};