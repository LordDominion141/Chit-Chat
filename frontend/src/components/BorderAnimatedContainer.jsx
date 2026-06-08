function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(45deg,#0b1326,#171f33_50%,#0b1326)_padding-box,conic-gradient(from_var(--border-angle),rgba(70,69,85,0.3)_80%,_#7c03d3_86%,_#ddb8ff_90%,_#7c03d3_94%,_rgba(70,69,85,0.3))_border-box] rounded-2xl border border-transparent animate-border flex overflow-hidden">  
      {children}  
    </div>  
  );  
}  
export default BorderAnimatedContainer;
