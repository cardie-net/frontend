"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { Locale } from "@/i18n/config"

export interface FlagIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  locale: Locale | string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FlagIcon({
  locale,
  className,
  size = "sm",
  ...props
}: FlagIconProps) {
  const sizeClasses = {
    sm: "w-4 h-3",
    md: "w-5 h-3.5",
    lg: "w-6 h-4.5",
  }[size]

  const code = locale.toLowerCase()

  const renderFlag = () => {
    switch (code) {
      case "en":
      case "gb":
      case "uk_gb":
        return (
          <svg
            viewBox="0 0 640 480"
            className="h-full w-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="#012169" d="M0 0h640v480H0z" />
            <path
              fill="#FFF"
              d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0h75z"
            />
            <path
              fill="#C8102E"
              d="m424 281 216 159v40L369 281h55zm-184-82L24 40V0l270 200h-54zM640 0v3L442 151l27 36L640 40V0zM0 440l197-148-27-36L0 411v29z"
            />
            <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z" />
            <path fill="#C8102E" d="M266 0h108v480H266zM0 186h640v108H0z" />
          </svg>
        )

      case "uk":
      case "ua":
        return (
          <svg
            viewBox="0 0 640 480"
            className="h-full w-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fillRule="evenodd">
              <path fill="#0057B7" d="M0 0h640v240H0z" />
              <path fill="#FFD700" d="M0 240h640v240H0z" />
            </g>
          </svg>
        )

      case "pt":
        return (
          <svg
            viewBox="0 0 640 480"
            className="h-full w-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="#de2910" d="M240 0h400v480H0z" />
            <path fill="#046a38" d="M0 0h240v480H0z" />
            <g transform="translate(240 240) scale(1.15)">
              <circle r="72" fill="#ffd700" stroke="#000" strokeWidth="6" />
              <circle r="52" fill="none" stroke="#000" strokeWidth="5" />
              <path
                fill="#fff"
                stroke="#de2910"
                strokeWidth="10"
                d="M-28-40h56v45c0 28-28 45-28 45s-28-17-28-45z"
              />
              <path
                fill="#002b7f"
                d="M-15-25h10v12h-10zm20 0h10v12h-10zM-5-5h10v12h-10zm-10 15h10v12h-10zm20 0h10v12h-10z"
              />
            </g>
          </svg>
        )

      default:
        return (
          <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
            {code.slice(0, 2)}
          </span>
        )
    }
  }

  return (
    <span
      className={cn(
        "inline-flex aspect-[4/3] shrink-0 items-center justify-center overflow-hidden rounded-[3px] shadow-2xs ring-1 ring-black/10 select-none dark:ring-white/15",
        sizeClasses,
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {renderFlag()}
    </span>
  )
}
