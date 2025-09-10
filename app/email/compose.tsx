import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
   Alert,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from 'react-native'

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  uri: string
}

interface ContactField {
  email: string
  name?: string
}

export default function ComposeScreen() {
  const router = useRouter()
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [requestReceipt, setRequestReceipt] = useState(false)

  // Handle attachment picker
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true
      })

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          name: asset.name || 'Unknown file',
          size: asset.size || 0,
          type: asset.mimeType || 'application/octet-stream',
          uri: asset.uri
        }))
        setAttachments(prev => [...prev, ...newAttachments])
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document')
    }
  }



  // Handle image picker
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!')
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8
      })

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          type: asset.type || 'image/jpeg',
          uri: asset.uri
        }))
        setAttachments(prev => [...prev, ...newAttachments])
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  // Handle camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera is required!')
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0]
        const newAttachment: Attachment = {
          id: `${Date.now()}`,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          type: asset.type || 'image/jpeg',
          uri: asset.uri
        }
        setAttachments(prev => [...prev, newAttachment])
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo')
    }
  }

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get priority color
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#ff4444'
      case 'low': return '#4CAF50'
      default: return Colors.tabIconDefault
    }
  }

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
    const emailData = {
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
          <View style={{ 
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0'
          }}>
            {/* To Field */}
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}>
              <Text style={{ 
                width: 40,
                fontSize: 16,
                color: Colors.text,
                fontWeight: '500'
              }}>To:</Text>
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder="Enter email addresses"
                style={{ 
                  flex: 1,
                  fontSize: 16,
                  color: Colors.text,
                  paddingVertical: 4
                }}
                multiline
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowCc(!showCc)}
                style={{ marginLeft: 8 }}
              >
                <Text style={{ 
                  color: Colors.tint,
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  {showCc ? 'Hide' : 'Cc/Bcc'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CC Field */}
            {showCc && (
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}>
                <Text style={{ 
                  width: 40,
                  fontSize: 16,
                  color: Colors.text,
                  fontWeight: '500'
                }}>Cc:</Text>
                <TextInput
                  value={cc}
                  onChangeText={setCc}
                  placeholder="Enter CC email addresses"
                  style={{ 
                    flex: 1,
                    fontSize: 16,
                    color: Colors.text,
                    paddingVertical: 4
                  }}
                  multiline
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowBcc(!showBcc)}
                  style={{ marginLeft: 8 }}
                >
                  <Text style={{ 
                    color: Colors.tint,
                    fontSize: 14,
                    fontWeight: '500'
                  }}>
                    {showBcc ? 'Hide Bcc' : 'Bcc'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BCC Field */}
            {showBcc && (
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0'
              }}>
                <Text style={{ 
                  width: 40,
                  fontSize: 16,
                  color: Colors.text,
                  fontWeight: '500'
                }}>Bcc:</Text>
                <TextInput
                  value={bcc}
                  onChangeText={setBcc}
                  placeholder="Enter BCC email addresses"
                  style={{ 
                    flex: 1,
                    fontSize: 16,
                    color: Colors.text,
                    paddingVertical: 4
                  }}
                  multiline
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Subject Field */}
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12
            }}>
              <Text style={{ 
                width: 60,
                fontSize: 16,
                color: Colors.text,
                fontWeight: '500'
              }}>Subject:</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter subject"
                style={{ 
                  flex: 1,
                  fontSize: 16,
                  color: Colors.text,
                  paddingVertical: 4
                }}
                autoCapitalize="sentences"
              />
            </View>
          </View>

          {/* Options Bar */}
          <View style={{ 
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
            justifyContent: 'space-between'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Priority Selector */}
              <TouchableOpacity 
                onPress={() => {
                  const priorities: Array<'low' | 'normal' | 'high'> = ['low', 'normal', 'high']
                  const currentIndex = priorities.indexOf(priority)
                  const nextIndex = (currentIndex + 1) % priorities.length
                  setPriority(priorities[nextIndex])
                }}
                style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: '#f8f9fa',
                  marginRight: 12
                }}
              >
                <IconSymbol 
                  name="exclamationmark" 
                  size={14} 
                  color={getPriorityColor()} 
                />
                <Text style={{ 
                  marginLeft: 4,
                  fontSize: 12,
                  color: getPriorityColor(),
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {priority}
                </Text>
              </TouchableOpacity>

              {/* Request Receipt */}
              <TouchableOpacity 
                onPress={() => setRequestReceipt(!requestReceipt)}
                style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: requestReceipt ? Colors.tint + '20' : '#f8f9fa'
                }}
              >
                <IconSymbol 
                  name="checkmark.circle" 
                  size={14} 
                  color={requestReceipt ? Colors.tint : Colors.tabIconDefault} 
                />
                <Text style={{ 
                  marginLeft: 4,
                  fontSize: 12,
                  color: requestReceipt ? Colors.tint : Colors.tabIconDefault,
                  fontWeight: '500'
                }}>
                  Receipt
                </Text>
              </TouchableOpacity>
            </View>

            {/* Attachment Count */}
            {attachments.length > 0 && (
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: Colors.tint + '20'
              }}>
                <IconSymbol name="paperclip" size={12} color={Colors.tint} />
                <Text style={{ 
                  marginLeft: 4,
                  fontSize: 12,
                  color: Colors.tint,
                  fontWeight: '500'
                }}>
                  {attachments.length}
                </Text>
              </View>
            )}
          </View>

          {/* Body Field */}
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

          {/* Attachments List */}
          {attachments.length > 0 && (
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
                <View key={attachment.id} style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  marginBottom: 8
                }}>
                  <IconSymbol 
                    name={attachment.type.startsWith('image/') ? 'photo' : 'doc.text'} 
                    size={20} 
                    color={Colors.tabIconDefault} 
                  />
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
                      {formatFileSize(attachment.size)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeAttachment(attachment.id)}
                    style={{ 
                      padding: 4,
                      marginLeft: 8
                    }}
                  >
                    <IconSymbol name="xmark" size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Bottom padding for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Attachment Actions Bar */}
        <View style={{ 
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          justifyContent: 'space-around'
        }}>
          <TouchableOpacity 
            onPress={pickDocument}
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: '#f8f9fa'
            }}
          >
            <IconSymbol name="doc" size={20} color={Colors.tint} />
            <Text style={{ 
              marginLeft: 6,
              fontSize: 14,
              color: Colors.tint,
              fontWeight: '500'
            }}>
              File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={pickImage}
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: '#f8f9fa'
            }}
          >
            <IconSymbol name="photo" size={20} color={Colors.tint} />
            <Text style={{ 
              marginLeft: 6,
              fontSize: 14,
              color: Colors.tint,
              fontWeight: '500'
            }}>
              Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={takePhoto}
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: '#f8f9fa'
            }}
          >
            <IconSymbol name="camera" size={20} color={Colors.tint} />
            <Text style={{ 
              marginLeft: 6,
              fontSize: 14,
              color: Colors.tint,
              fontWeight: '500'
            }}>
              Camera
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}
