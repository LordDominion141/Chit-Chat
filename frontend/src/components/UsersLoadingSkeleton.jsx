function UsersLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((item) => (
        <div 
          key={item} 

          className="bg-[#4f46e5]/18 p-4 rounded-xl animate-pulse border border-[#4f46e5]/10 shadow-sm"
        >
          <div className="flex items-center gap-3">

            <div className="size-12 bg-[#131b2e] border border-[#464555]/30 rounded-full shrink-0"></div>
            
            <div className="flex-1 min-w-0">


              <div className="h-4 bg-[#131b2e] border border-[#464555]/20 rounded-md w-2/3 mb-2"></div>
              

              <div className="h-3 bg-[#131b2e]/60 border border-[#464555]/10 rounded-md w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersLoadingSkeleton;
