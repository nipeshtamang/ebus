import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
        className
      )}
      {...props}
    />
  );
}

// Card skeleton with improved styling
export function CardSkeleton() {
  return (
    <div className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// Table skeleton with better responsive design
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl overflow-hidden">
        <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 md:p-6">
          <Skeleton className="h-5 w-1/4" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-1/6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard stats skeleton with improved grid layout
export function StatsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl"
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Card */}
      <div className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-lg p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-gray-100 rounded-lg gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Form skeleton with better spacing
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Booking card skeleton with improved layout
export function BookingCardSkeleton() {
  return (
    <div className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// Schedule card skeleton
export function ScheduleCardSkeleton() {
  return (
    <div className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// Payment history skeleton
export function PaymentHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Profile skeleton with better layout
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <FormSkeleton />
    </div>
  );
}

// Loading spinner skeleton
export function LoadingSpinnerSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// Page header skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-white via-teal-50/50 to-cyan-50/50 border-b border-teal-100 shadow-sm px-4 py-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
