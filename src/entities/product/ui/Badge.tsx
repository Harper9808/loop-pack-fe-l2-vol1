export interface BadgeProps {
  variant: 'discount' | 'new' | 'hot' | 'best' | 'soldout' | 'warning'
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps): React.ReactElement {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
