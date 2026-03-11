import * as React from 'react'
import { cn } from '@/lib/utils'

interface MenuCardProps {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function MenuCard({ title, children, className }: MenuCardProps) {
  return (
    <div className={cn('relative mt-6', className)}>
      {/* Title straddling the top border — "fieldset legend" effect */}
      <div className="absolute top-0 left-6 -translate-y-1/2 px-3 bg-[#FFFBF8] z-10 whitespace-nowrap">
        <h2 className="menu-card-title">{title}</h2>
      </div>

      {/* Card body */}
      <div
        className="bg-white rounded-xl border-2 border-[#415B8F] px-6 pt-7 pb-6"
        style={{ boxShadow: '4px 4px 0 0 #415B8F' }}
      >
        {/* Dotted divider below the title */}
        <div className="border-t border-dotted border-[#415B8F]/25 mb-4" />

        {children}
      </div>
    </div>
  )
}

interface MenuCardRowProps {
  label: string
  description?: string
  value?: React.ReactNode
  className?: string
}

export function MenuCardRow({ label, description, value, className }: MenuCardRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div>
        <p className="font-bold text-[#415B8F] text-sm leading-tight">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {value !== undefined && (
        <div className="font-black text-[#415B8F] shrink-0">{value}</div>
      )}
    </div>
  )
}
