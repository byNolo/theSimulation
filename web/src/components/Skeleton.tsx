import React from 'react'

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white/5 animate-pulse rounded-xl ${className}`}></div>
  )
}

export default Skeleton
