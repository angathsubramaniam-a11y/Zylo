export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.75rem] border border-white/50 bg-white/60 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
          <div className="skeleton h-52 rounded-3xl" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-5 w-4/5 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="flex items-center gap-3 pt-3">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="skeleton h-4 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
