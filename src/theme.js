// theme.js
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',  // blue variants
        contrastText: '#fff',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#d81b60', // pink variants
        contrastText: '#fff',
      },
      text: {
        primary: mode === 'dark' ? '#fff' : '#333',
        secondary: mode === 'dark' ? '#b0b3c5' : '#666',
      },
      background: {
        default: mode === 'dark' ? '#2C2C2C' : '#F3F3F3',
        gradient: mode === 'dark'
          ? 'linear-gradient(135deg, #0E0B1A, #2C2540, rgba(60, 50, 90, 0.6))'
          : 'linear-gradient(to bottom, #E3F2FD, #FCE4EC)',
        boxShadow : mode==='dark' ? "0 4px 10px rgba(0, 0, 0, 0.8), 0 0 10px rgba(58, 63, 92, 0.7)"  
        : "0 8px 30px rgba(0, 0, 0, 0.1)", 
      },
      sidebar: {
        drawerGradient: mode === 'dark'
          ? 'linear-gradient(180deg, rgba(26, 22, 44, 0.8), rgba(42, 35, 66, 0.6))'
          : 'linear-gradient(135deg, #AEC6FF, #F8C3E6)',
        drawerHeaderBg: mode === 'dark'
          ? 'linear-gradient(135deg, #3A3F5C, #2A2D3E)'
          : 'linear-gradient(135deg, #97A5EE, #95DFF2)',
        textColor: mode === 'dark' ? '#B0B3C5' : '#333',
        hoverBg: mode === 'dark' ? '#32324A' : '#C084D3',
        iconColor: mode === 'dark' ? '#9FA1B3' : '#5C6BC0',
      },
      cards: {
        income: mode === 'dark' ? '#1b2a3a' : '#e3f2fd',
        expenses: mode === 'dark' ? '#3a1b1b' : '#ffebee',
        savings: mode === 'dark' ? '#1b3a2b' : '#e8f5e9',
        investments: mode === 'dark' ? '#2f1b3a' : '#ede7f6',
        scheduled: mode === 'dark' ? '#3a2f1b' : '#fff3e0',
      },
      gradients: {
        income: mode === 'dark'
          ? 'linear-gradient(135deg, #0D47A1, #1976D2)'
          : 'linear-gradient(135deg, #D4E5FF, #A9C5FF)',
        expenses: mode === 'dark'
          ? 'linear-gradient(135deg, #B71C1C, #F44336)'
          : 'linear-gradient(135deg, #FFCDD2, #EF9A9A)',
        savings: mode === 'dark'
          ? 'linear-gradient(135deg, #1B5E20, #4CAF50)'
          : 'linear-gradient(135deg, #C8E6C9, #A5D6A7)',
        investments: mode === 'dark'
          ? 'linear-gradient(135deg, #4A148C, #9C27B0)'
          : 'linear-gradient(135deg, #E1BEE7, #CE93D8)',
        scheduled: mode === 'dark'
          ? 'linear-gradient(135deg, #FF6F00, #FF8F00)'
          : 'linear-gradient(135deg, #FFE0B2, #FFCC80)',
      },
      filters:{
        dropdown : mode==='dark' ? 'linear-gradient(135deg, #1e1e1e, #2a2a2a)' : 'linear-gradient(135deg, #fff, #fce4ec)',
        dropdownShadow : mode==='dark' ? '0 2px 6px rgba(255, 255, 255, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
        dropdownColor : mode==='dark' ? '#eee' : '#333',
        background : mode==='dark'? 'linear-gradient(135deg, #2C1C3C, #5D4E7A)' : "#fff",
      },
      table:{
        headerRow: mode === 'dark' ? '#3A2F55' : '#1E88E5',               // subtle navy-gray for dark headers
        tableCell: mode === 'dark' ? '#2B2344' : '#3949ab',               // consistent but distinct cell background
        hoverColor: mode === 'dark' ? '#443A68' : '#e3f2fd',              // soft hover in dark mode
        evenRow: mode === 'dark' ? '#2F284A' : '#f5f5f5',                 // slightly lighter row
        oddRow: mode === 'dark' ? '#261F3D' : '#ffffff',   
        borderColor: mode==='dark'? '#4D3E77':"#C6CAE0", 
        textColor: mode === 'dark' ? '#E5E1F5':'#2A2A2A',
        paperBackground: mode==='dark'? "linear-gradient(135deg, #1C1B29 0%, #26243D 100%)":"linear-gradient(135deg, #F5F7FB 0%, #E8EBF5 100%)'",
      },
      button: {
        containedPrimaryBg: mode === 'dark' ? '#4285F4' : '#4285F4',
        containedPrimaryHover: mode === 'dark' ? '#3367D6' : '#3367D6',
        containedPrimaryText: '#fff',
      },
      dialog:{
        backgroundColor : mode ==='dark' ? "rgba(28, 27, 41, 0.95)" : "rgba(255, 255, 255, 0.9)",
        boxShadow : mode==='dark' ? "0px 8px 16px rgba(0, 0, 0, 0.6)" : "0px 8px 16px rgba(0, 0, 0, 0.2)",
        titleColor : mode === 'dark' ? "#E5E1F5" : "#333",
      },

    },
  });
