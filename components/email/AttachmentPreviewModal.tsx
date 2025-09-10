import { IconSymbol } from '@/components/ui/IconSymbol'
import React, { useEffect, useRef } from 'react'
import {
    Alert,
    Animated,
    Image,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { Attachment } from './types'

interface AttachmentPreviewModalProps {
  attachment: Attachment | null
  onClose: () => void
  onRemove: (id: string) => void
  formatFileSize: (bytes: number) => string
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  onClose,
  onRemove,
  formatFileSize
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Handle fade animation
  useEffect(() => {
    if (attachment) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150, // Faster fade in
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100, // Even faster fade out
        useNativeDriver: true,
      }).start()
    }
  }, [attachment, fadeAnim])

  const handleRemove = () => {
    if (!attachment) return
    
    Alert.alert(
      'Remove Attachment',
      `Remove "${attachment.name}" from email?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onRemove(attachment.id)
            onClose()
          }
        }
      ]
    )
  }

  const getFileTypeDisplay = (type: string) => {
    if (type.includes('text')) return 'Text Document'
    if (type.includes('pdf')) return 'PDF Document'
    if (type.includes('video')) return 'Video File'
    if (type.includes('audio')) return 'Audio File'
    return 'Document'
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'doc.richtext'
    if (type.includes('text')) return 'doc.text'
    if (type.includes('video')) return 'play.rectangle'
    if (type.includes('audio')) return 'music.note'
    return 'doc'
  }

  return (
    <Modal
      visible={attachment !== null}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeAnim
      }}>
        {attachment && (
          <>
            {/* Header */}
            <View style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 60 : 40,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              zIndex: 1
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600'
                }} numberOfLines={1}>
                  {attachment.name}
                </Text>
                <Text style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 12,
                  marginTop: 2
                }}>
                  {formatFileSize(attachment.size)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <IconSymbol name="xmark" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Preview Content */}
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 120,
              paddingBottom: 60
            }}>
              {attachment.type.startsWith('image/') ? (
                <ScrollView
                  contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100%'
                  }}
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  <Image
                    source={{ uri: attachment.uri }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      minWidth: 200,
                      minHeight: 200
                    }}
                    resizeMode="contain"
                  />
                </ScrollView>
              ) : (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 40,
                  minWidth: 200
                }}>
                  <IconSymbol
                    name={getFileIcon(attachment.type)}
                    size={64}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '500',
                    marginTop: 16,
                    textAlign: 'center'
                  }}>
                    {getFileTypeDisplay(attachment.type)}
                  </Text>
                  <Text style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 14,
                    marginTop: 8,
                    textAlign: 'center'
                  }}>
                    Preview not available for this file type
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom Actions */}
            <View style={{
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? 40 : 20,
              left: 20,
              right: 20,
              flexDirection: 'row',
              justifyContent: 'center'
            }}>
              <TouchableOpacity
                onPress={handleRemove}
                style={{
                  backgroundColor: 'rgba(255,68,68,0.9)',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <IconSymbol name="trash" size={16} color="white" />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  marginLeft: 8
                }}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Modal>
  )
}