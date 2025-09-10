import { Colors } from '@/constants/Colors'
import React from 'react'
import { TextInput, View } from 'react-native'

interface EmailBodyProps {
  body: string
  setBody: (value: string) => void
}

export const EmailBody: React.FC<EmailBodyProps> = ({
  body,
  setBody
}) => {
  return (
    <View style={{ 
      backgroundColor: 'white',
      minHeight: 300,
      paddingHorizontal: 16,
      paddingTop: 16
    }}>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Compose your message..."
        style={{ 
          fontSize: 16,
          color: Colors.text,
          lineHeight: 24,
          textAlignVertical: 'top',
          minHeight: 250
        }}
        multiline
        textAlignVertical="top"
        autoCapitalize="sentences"
      />
    </View>
  )
}