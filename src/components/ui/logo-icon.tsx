import { type ImgHTMLAttributes } from 'react'

export function LogoIcon(props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  return <img src="/logo.ico" alt="StagePilot" {...props} />
}
