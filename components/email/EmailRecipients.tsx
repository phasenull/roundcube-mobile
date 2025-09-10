import { Colors } from '@/constants/Colors'
import React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

interface EmailRecipientsProps {
  to: string
  setTo: (value: string) => void
  cc: string
  setCc: (value: string) => void
  bcc: string
  setBcc: (value: string) => void
  subject: string
  setSubject: (value: string) => void
  showCc: boolean
  setShowCc: (value: boolean) => void
  showBcc: boolean
  setShowBcc: (value: boolean) => void
}

export const EmailRecipients: React.FC<EmailRecipientsProps> = ({
  to,
  setTo,
  cc,
  setCc,
  bcc,
  setBcc,
  subject,
  setSubject,
  showCc,
  setShowCc,
  showBcc,
  setShowBcc
}) => {
  return (
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
  )
}