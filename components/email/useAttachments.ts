import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Alert } from 'react-native'
import { Attachment } from './types'

export const useAttachments = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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

  return {
    attachments,
    setAttachments,
    pickDocument,
    pickImage,
    takePhoto,
    removeAttachment,
    formatFileSize
  }
}