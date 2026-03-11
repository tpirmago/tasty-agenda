import { useId } from 'react'
import { cn } from '@/lib/utils'

interface PageHeadingProps {
  children: React.ReactNode
  className?: string
  size?: 'xl' | '2xl'
}

export function PageHeading({ children, className, size = 'xl' }: PageHeadingProps) {
  const uid = useId().replace(/:/g, '')
  const patternId = `wave-${uid}`

  return (
    <div className={cn('w-fit', className)}>
      <h1
        className={cn('font-bold', size === '2xl' ? 'text-2xl' : 'text-xl')}
        style={{ color: '#415B8F' }}
      >
        {children}
      </h1>
      <svg
        width="100%"
        height="18"
        xmlns="http://www.w3.org/2000/svg"
        className="mt-2"
      >
        <defs>
          <pattern id={patternId} x="0" y="0" width="42" height="18" patternUnits="userSpaceOnUse">
            <path
              d="M0 9 C14 2, 28 16, 42 9"
              stroke="#415B8F"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="18" fill={`url(#${patternId})`} />
      </svg>
    </div>
  )
}
