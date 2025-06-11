import React from 'react';
import { Settings, Search, GitBranch, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Skeleton component for reusable animated skeleton elements
const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-700 rounded animate-pulse ${className}`} />
);

// Skeleton for toggle switch
const ToggleSkeleton = () => (
  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
    <span className="inline-block h-4 w-4 transform rounded-full bg-gray-400 translate-x-1" />
  </div>
);

// Skeleton for branch item
const BranchItemSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80">
    <div className="flex items-center space-x-3">
      <GitBranch className="w-4 h-4 text-gray-400" />
      <Skeleton width="w-24" />
    </div>
    <div className="flex items-center space-x-3">
      <ToggleSkeleton />
      <div className="w-4 h-4 rounded-full bg-gray-600" />
    </div>
  </div>
);

// Skeleton for active branch card
const ActiveBranchSkeleton = () => (
  <div className="rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 p-4 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <div className="border border-[#222222] p-3 rounded-full">
          <GitBranch className="w-4 h-4 text-gray-400" />
        </div>
        <div className="w-2.5 h-2.5 rounded-full -ml-2.5 mt-6 bg-gray-500" />
      </div>
      <div className="space-y-2">
        <Skeleton width="w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton width="w-20" height="h-3" />
          <Skeleton width="w-16" height="h-3" />
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <Skeleton width="w-24" height="h-4" />
      <Skeleton width="w-20" height="h-8" />
      <div className="w-4 h-4 bg-gray-600 rounded" />
    </div>
  </div>
);

export default function DeploymentStatusSkeleton() {
  return (
    <div className="flex flex-col z-0 md:py-7 md:flex-row min-h-[80vh] text-white">
      <div className="md:container p-3">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-2">
            <Skeleton width="w-80" height="h-8" />
          </div>
          <Skeleton width="w-96" height="h-4" />
        </div>

        <Separator className="mb-6" />

        {/* Branch Deployment Settings Card */}
        <div className="p-4 mb-8 rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <div className="space-y-2">
                <Skeleton width="w-40" height="h-5" />
                <Skeleton width="w-80" height="h-4" />
              </div>
            </div>
            <ToggleSkeleton />
          </div>
        </div>

        {/* Branch Selection Section (simulating expanded state) */}
        <div className="rounded-md border border-neutral-900 bg-arlink-bg-secondary-color/80 p-6 mb-8">
          <div className="mb-4">
            {/* Warning Banner */}
            <div className="bg-[#DF7F00]/10 border border-[#553700] rounded-lg p-3 mb-4 flex items-center space-x-4">
              <DollarSign className="text-[#CB9800] w-5 h-5" />
              <Skeleton width="w-96" height="h-4" />
            </div>

            {/* Section Header */}
            <div className="mb-4">
              <Skeleton width="w-48" height="h-5" className="mb-2" />
              <Skeleton width="w-24" height="h-4" />
            </div>

            {/* Branch List */}
            <div className="space-y-2 mb-6">
              {[...Array(4)].map((_, index) => (
                <BranchItemSkeleton key={index} />
              ))}
            </div>

            {/* Deploy Button */}
            <div className="bg-gray-600 text-white font-semibold py-2 px-4 rounded opacity-50">
              <Skeleton width="w-24" height="h-5" />
            </div>
          </div>
        </div>

        {/* Active Branches Section */}
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton width="w-40" height="h-6" />
              <div className="flex items-center space-x-2">
                <Skeleton width="w-32" height="h-4" />
                <div className="bg-gray-600 text-black px-1 rounded text-xs font-mono">
                  <Skeleton width="w-16" height="h-4" />
                </div>
                <Skeleton width="w-40" height="h-4" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-2 border border-neutral-800 rounded px-3 py-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm">Status</span>
                <span className="text-xs text-gray-400">-/-</span>
              </div>
              
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <div className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-48">
                  <Skeleton width="w-20" height="h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Branch Cards */}
          <div className="space-y-1">
            {[...Array(3)].map((_, index) => (
              <ActiveBranchSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}