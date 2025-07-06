import React, { createContext, useState, useEffect } from 'react';
import { THEMES } from '../utils/constants';

export const ThemeContext = createContext({
  theme: THEMES.DARK,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === THEMES.LIGHT ? 'light' : 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 