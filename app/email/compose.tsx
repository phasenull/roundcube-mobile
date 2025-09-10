import {
  Attachment,
  AttachmentActionsBar,
  AttachmentPreviewModal,
  AttachmentsList,
  EmailBody,
  EmailData,
  EmailOptions,
  EmailRecipients,
  Priority,
  useAttachments
} from '@/components/email'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export default function ComposeScreen() {
  const router = useRouter()
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [priority, setPriority] = useState<Priority>('normal')
  const [requestReceipt, setRequestReceipt] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)

  // Use attachment hooks
  const {
    attachments,
    pickDocument,
    pickImage,
    takePhoto,
    removeAttachment,
    formatFileSize
  } = useAttachments()

  // Handle send (placeholder for your mutation logic)
  const handleSend = () => {
    if (!to.trim()) {
      Alert.alert('Error', 'Please enter at least one recipient')
      return
    }
    
    if (!subject.trim()) {
      Alert.alert('Confirm', 'Send email without subject?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => performSend() }
      ])
      return
    }
    
    performSend()
  }

  const performSend = () => {
    // This is where you'll implement your mutation logic
    const emailData: EmailData = {
      to: to.trim(),
      cc: cc.trim(),
      bcc: bcc.trim(),
      subject: subject.trim(),
      body: body.trim(),
      attachments,
      priority,
      requestReceipt
    }
    
    console.log('Email data to send:', emailData)
    Alert.alert('Ready to Send', 'Email data prepared. Implement your mutation logic here.')
  }

  const handlePreviewAttachment = (attachment: Attachment) => {
    setPreviewAttachment(attachment)
  }

  const handleRemoveAttachment = (id: string) => {
    removeAttachment(id)
    if (previewAttachment?.id === id) {
      setPreviewAttachment(null)
    }
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Compose',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ 
                padding: 8,
                marginLeft: -8
              }}
            >
              <IconSymbol name="xmark" size={20} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSend}
              style={{ 
                backgroundColor: Colors.tint,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                marginRight: -8
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Recipients Section */}
          <EmailRecipients
            to={to}
            setTo={setTo}
            cc={cc}
            setCc={setCc}
            bcc={bcc}
            setBcc={setBcc}
            subject={subject}
            setSubject={setSubject}
            showCc={showCc}
            setShowCc={setShowCc}
            showBcc={showBcc}
            setShowBcc={setShowBcc}
          />

          {/* Options Bar */}
          <EmailOptions
            priority={priority}
            setPriority={setPriority}
            requestReceipt={requestReceipt}
            setRequestReceipt={setRequestReceipt}
            attachmentsCount={attachments.length}
          />

          {/* Body Field */}
          <EmailBody
            body={body}
            setBody={setBody}
          />

          {/* Attachments List */}
          <AttachmentsList
            attachments={attachments}
            onPreviewAttachment={handlePreviewAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            formatFileSize={formatFileSize}
          />

          {/* Bottom padding for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Attachment Actions Bar */}
        <AttachmentActionsBar
          onPickDocument={pickDocument}
          onPickImage={pickImage}
          onTakePhoto={takePhoto}
        />
      </KeyboardAvoidingView>

      {/* Preview Modal */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        onRemove={handleRemoveAttachment}
        formatFileSize={formatFileSize}
      />
    </>
  )
}
