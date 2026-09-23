'use client'
import { useRef } from 'react'
import HCaptchaLib from '@hcaptcha/react-hcaptcha'

export default function HCaptcha({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void
  onExpire: () => void
}) {
  const ref = useRef<HCaptchaLib>(null)
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

  if (!siteKey) return null

  return (
    <HCaptchaLib
      ref={ref}
      sitekey={siteKey}
      onVerify={onVerify}
      onExpire={onExpire}
      theme="light"
      size="normal"
    />
  )
}
