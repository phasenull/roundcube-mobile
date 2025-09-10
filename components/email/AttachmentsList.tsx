import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { Attachment } from './types'

interface AttachmentsListProps {
  attachments: Attachment[]
  onPreviewAttachment: (attachment: Attachment) => void
  onRemoveAttachment: (id: string) => void
  formatFileSize: (bytes: number) => string
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  onPreviewAttachment,
  onRemoveAttachment,
  formatFileSize
}) => {
  if (attachments.length === 0) {
    return null
  }

  return (
    <View style={{ 
      backgroundColor: 'white',
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0'
    }}>
      <Text style={{ 
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12
      }}>
        Attachments ({attachments.length})
      </Text>
      {attachments.map((attachment) => (
        <TouchableOpacity 
          key={attachment.id}
          onPress={() => onPreviewAttachment(attachment)}
          style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            marginBottom: 8
          }}
        >
          {/* Preview thumbnail or icon */}
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 6,
            backgroundColor: '#e0e0e0',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {attachment.type.startsWith('image/') ? (
              <Image 
                source={{ uri: attachment.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <IconSymbol 
                name={
                  attachment.type.includes('pdf') ? 'doc.richtext' :
                  attachment.type.includes('text') ? 'doc.text' :
                  attachment.type.includes('video') ? 'play.rectangle' :
                  attachment.type.includes('audio') ? 'music.note' :
                  'doc'
                } 
                size={20} 
                color={Colors.tabIconDefault} 
              />
            )}
          </View>
          
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ 
              fontSize: 14,
              color: Colors.text,
              fontWeight: '500'
            }} numberOfLines={1}>
              {attachment.name}
            </Text>
            <Text style={{ 
              fontSize: 12,
              color: Colors.tabIconDefault,
              marginTop: 2
            }}>
              {formatFileSize(attachment.size)} • Tap to preview
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation()
              onRemoveAttachment(attachment.id)
            }}
            style={{ 
              padding: 4,
              marginLeft: 8
            }}
          >
            <IconSymbol name="xmark" size={16} color="#ff4444" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  )
}