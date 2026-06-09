function MessagesLoadingSkeleton() {
  const skeletalWidths = ["w-48", "w-32", "w-64", "w-40", "w-56", "w-36"];

  return (
    <div className="w-full max-w-full space-y-6">
      {[...Array(6)].map((_, index) => {
        const isOutgoing = index % 2 !== 0;
        return (
          <div
            key={index}
            className={`chat ${isOutgoing ? "chat-end" : "chat-start"} animate-pulse w-full`}
          >
            <div
              className={`h-10 shadow-md ${skeletalWidths[index] || "w-48"} 
              ${
                isOutgoing
                  ? "bg-[#4f46e5]/40 rounded-2xl rounded-tr-none"
                  : "bg-[#1e293b]/60 rounded-2xl rounded-tl-none border border-[#464555]/20"
              }`}
            ></div>
          </div>
        );
      })}
    </div>
  );
}

export default MessagesLoadingSkeleton;
