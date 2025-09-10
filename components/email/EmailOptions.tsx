import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Priority } from './types'

interface EmailOptionsProps {
  priority: Priority
  setPriority: (priority: Priority) => void
  requestReceipt: boolean
  setRequestReceipt: (value: boolean) => void
  attachmentsCount: number
}

export const EmailOptions: React.FC<EmailOptionsProps> = ({
  priority,
  setPriority,
  requestReceipt,
  setRequestReceipt,
  attachmentsCount
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#ff4444'
      case 'low': return '#4CAF50'
      default: return Colors.tabIconDefault
    }
  }

  const handlePriorityChange = () => {
    const priorities: Priority[] = ['low', 'normal', 'high']
    const currentIndex = priorities.indexOf(priority)
    const nextIndex = (currentIndex + 1) % priorities.length
    setPriority(priorities[nextIndex])
  }

  return (
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
          onPress={handlePriorityChange}
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
      {attachmentsCount > 0 && (
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
            {attachmentsCount}
          </Text>
        </View>
      )}
    </View>
  )
}