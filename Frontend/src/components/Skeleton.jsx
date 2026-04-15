import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse skeleton ${className}`} />
  );
}

export function SkeletonText({ className = "" }) {
  return <Skeleton className={`h-4 w-full ${className}`} />;
}

export function SkeletonAvatar({ className = "" }) {
  return <Skeleton className={`rounded-full ${className}`} />;
}

export function SkeletonButton({ className = "" }) {
  return <Skeleton className={`rounded-md h-9 ${className}`} />;
}

/**
 * Higher-order component to handle loading states automatically
 */
export function withSkeleton(Component, SkeletonComponent) {
  return ({ isLoading, ...props }) => {
    if (isLoading) return <SkeletonComponent />;
    return <Component {...props} />;
  };
}
