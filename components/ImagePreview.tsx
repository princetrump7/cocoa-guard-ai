'use client'

interface Props {
  src: string
  alt?: string
  className?: string
}

/** Plain <img> — avoid next/image optimizer complexity for user uploads. */
export default function ImagePreview({ src, alt = 'Scan preview', className = '' }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`rounded-xl object-cover ${className}`} />
  )
}
