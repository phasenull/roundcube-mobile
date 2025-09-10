export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  uri: string
}

export interface ContactField {
  email: string
  name?: string
}

export type Priority = 'low' | 'normal' | 'high'

export interface EmailData {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  attachments: Attachment[]
  priority: Priority
  requestReceipt: boolean
}