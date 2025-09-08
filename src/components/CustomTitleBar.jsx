import React, { useState, useEffect } from 'react';

const CustomTitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximized state
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized);
      
      // Listen for window state changes
      const handleWindowStateChange = (state) => {
        if (state.isMaximized !== undefined) {
          setIsMaximized(state.isMaximized);
        }
      };
      
      if (window.electronAPI.onWindowStateChanged) {
        window.electronAPI.onWindowStateChanged(handleWindowStateChange);
        
        // Cleanup listener on unmount
        return () => {
          if (window.electronAPI.removeWindowStateListener) {
            window.electronAPI.removeWindowStateListener(handleWindowStateChange);
          }
        };
      }
    }
  }, []);

  const handleMinimize = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.window.maximize();
      if (result && result.isMaximized !== undefined) {
        setIsMaximized(result.isMaximized);
      } else {
        // Fallback: check current state after operation
        const currentState = await window.electronAPI.isMaximized();
        setIsMaximized(currentState);
      }
    }
  };

  const handleClose = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.window.close();
    }
  };

  return (
    <div className="custom-titlebar">
      {/* Drag area (left side) */}
      <div className="drag-region"></div>
      
      {/* Window controls (right side) */}
      <div className="window-controls">
        <button
          className="control-button minimize"
          onClick={handleMinimize}
          title="Minimizar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M0,6 L12,6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        
        <button
          className="control-button maximize"
          onClick={handleMaximize}
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          {isMaximized ? (
            // Show restore icon (two overlapping squares) when window is maximized
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2,2 L10,2 L10,10 L2,10 Z M4,0 L12,0 L12,8" 
                    fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            // Show maximize icon (single square) when window is not maximized
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M0,0 L12,0 L12,12 L0,12 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
        
        <button
          className="control-button close"
          onClick={handleClose}
          title="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M0,0 L12,12 M12,0 L0,12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar;