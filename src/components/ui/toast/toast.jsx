import * as React from "react"

function Toast({ title, description, action, ...props }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex w-full max-w-sm animate-in fade-in slide-in-from-bottom-5 flex-col items-start gap-1 rounded-md bg-white p-6 shadow-lg duration-200 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full sm:max-w-sm`}
      {...props}
    >
      {title && <div className="text-sm font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
      {action}
    </div>
  )
}

export { Toast }