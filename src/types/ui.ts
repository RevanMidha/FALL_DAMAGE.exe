export type ToastTone = 'danger' | 'warning' | 'system'

export type ToastState = {
  title: string
  detail: string
  tone: ToastTone
}
