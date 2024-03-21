import Delete from '@mui/icons-material/Delete';
import { Paper, IconButton } from '@mui/material';
import React from 'react';

const consoleStyle = {
  fontSize: '0.75rem',
  lineHeight: '1.2',
};

const SIDELogger: React.FC = () => {
  const logContainer = React.useRef<HTMLPreElement>(null);
  
  const handleLog = React.useCallback((level: string, log: string) => {
    const el = logContainer.current;
    if (!el) return;
    const newLogEntry = document.createTextNode(
      `${new Date().toLocaleTimeString()} [${level}] ${log}\n`
    );
    el.appendChild(newLogEntry);
    el.scrollTo(0, el.scrollHeight);
  }, []); // useCallback ensures this function is memoized and not recreated on each render.

  React.useEffect(() => {
    window.sideAPI.system.onLog.addListener(handleLog);
    return () => {
      window.sideAPI.system.onLog.removeListener(handleLog);
    };
  }, [handleLog]); // Depend on handleLog which is now memoized.

  return (
    <>
      <div className="p-1 pos-abs" style={{ top: 0, right: 0 }}>
        <Paper className="p-1" elevation={3} square>
          <IconButton
            onClick={() => {
              const el = logContainer.current;
              if (el) {
                el.textContent = ''; // Safer and potentially faster than innerHTML
              }
            }}
          >
            <Delete />
          </IconButton>
        </Paper>
      </div>
      <pre
        className="fill m-0 overflow-y"
        ref={logContainer}
        style={consoleStyle}
      />
    </>
  );
};

export default SIDELogger;
