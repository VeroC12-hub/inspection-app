import { useToast } from "./use-toast"
import { Toast } from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          title={title}
          description={description}
          action={action}
          {...props}
        />
      ))}
    </>
  )
}