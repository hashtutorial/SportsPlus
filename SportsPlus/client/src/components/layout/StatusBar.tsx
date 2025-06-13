export function StatusBar() {
  // Get current time in format HH:MM
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  return (
    <div className="bg-primary h-6 flex justify-between items-center px-4 text-xs">
      <span>{currentTime}</span>
      <div className="flex space-x-1">
        <span className="material-icons text-sm">signal_cellular_alt</span>
        <span className="material-icons text-sm">wifi</span>
        <span className="material-icons text-sm">battery_full</span>
      </div>
    </div>
  );
}
