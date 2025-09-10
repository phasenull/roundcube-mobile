import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface AttachmentActionsBarProps {
  onPickDocument: () => void
  onPickImage: () => void
  onTakePhoto: () => void
}

export const AttachmentActionsBar: React.FC<AttachmentActionsBarProps> = ({
  onPickDocument,
  onPickImage,
  onTakePhoto
}) => {
  return (
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
        onPress={onPickDocument}
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
        onPress={onPickImage}
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
        onPress={onTakePhoto}
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
  )
}