import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useGetRequestToken } from "@/hooks/core/email-hooks"
import { useSearchPeople } from "@/hooks/core/util-hooks"
import { useState } from "react"
import {
   ActivityIndicator,
   Modal,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from "react-native"

// Email validation function
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email.trim())
}

// Create a person object from email input
function createPersonFromEmail(email: string): Person {
	const trimmedEmail = email.trim()
	return {
		id: `email_${trimmedEmail}`,
		name: trimmedEmail,
		display: trimmedEmail,
		type: "email",
		source: "manual"
	}
}

export default function PersonPicker<T extends boolean>(props: {
	allow_multiple?: T
	initial_selected?: Person[]
	onSelect?: (person: T extends true ? Person[] : Person) => void
	onClose?: () => void
	visible?: boolean
}) {
	const [search, setSearch] = useState("")
	const { data: token } = useGetRequestToken()
	type RequestedPersonType = T extends true ? Person[] : Person
	const [selected, setSelected] = useState<Person[]>(
		props.initial_selected || []
	)

	function addOrRemovePerson(person: Person) {
		setSelected((current) => {
			if (props.allow_multiple) {
				if (current.find((p) => p.id === person.id)) {
					console.log("Removing person:", person.name)
					const new_selected = current.filter((p) => p.id !== person.id)
					return new_selected
				} else {
					console.log("Adding person:", person.name)
					const new_selected = [...current, person]
					return new_selected
				}
			} else {
				console.log("Selecting single person:", person.name)
				return [person]
			}
		})
	}

	const { data, isLoading, isError, error } = useSearchPeople(search, token)

	// Check if search input is a valid email
	const isSearchValidEmail = isValidEmail(search)
	
	// Combine search results with manual email option if applicable
	const combinedResults = () => {
		const searchResults = data?.results || []
		
		// If search is a valid email and not already in results, add it as an option
		if (isSearchValidEmail && search.length > 0) {
			const emailExists = searchResults.some(person => 
				person.name.toLowerCase() === search.toLowerCase() || 
				person.display?.toLowerCase() === search.toLowerCase()
			)
			
			if (!emailExists) {
				const manualPerson = createPersonFromEmail(search)
				return [manualPerson, ...searchResults]
			}
		}
		
		return searchResults
	}

	const finalResults = combinedResults()

	const handleDone = () => {
		props.onSelect?.(
			props.allow_multiple
				? (selected as RequestedPersonType)
				: (selected[0] as RequestedPersonType)
		)
		props.onClose?.()
	}

	const removeSelectedPerson = (personId: string) => {
		setSelected(current => current.filter(p => p.id !== personId))
	}

	return (
		<Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet">
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={props.onClose} style={styles.headerButton}>
						<IconSymbol name="arrow.left" size={24} color={Colors.text} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>
						{props.allow_multiple ? "Select People" : "Select Person"}
					</Text>
					<TouchableOpacity 
						onPress={handleDone} 
						style={[
							styles.doneButton,
							{ 
								opacity: selected.length === 0 ? 0.5 : 1,
								backgroundColor: selected.length === 0 ? Colors.tabIconDefault : Colors.tint
							}
						]}
						disabled={selected.length === 0}
					>
						<Text style={styles.doneButtonText}>Done</Text>
					</TouchableOpacity>
				</View>

				{/* Selected People Pills */}
				{selected.length > 0 && (
					<View style={styles.selectedSection}>
						<Text style={styles.selectedLabel}>
							Selected ({selected.length})
						</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
							{selected.map((person) => (
								<SelectedPersonPill
									key={person.id}
									person={person}
									onRemove={() => removeSelectedPerson(person.id)}
								/>
							))}
						</ScrollView>
					</View>
				)}

				{/* Search Input */}
				<View style={styles.searchSection}>
					<View style={styles.searchContainer}>
						<IconSymbol name="magnifyingglass" size={20} color={Colors.tabIconDefault} />
						<TextInput
							value={search}
							onChangeText={setSearch}
							placeholder="Search people..."
							style={styles.searchInput}
							placeholderTextColor={Colors.tabIconDefault}
							autoCapitalize="none"
							autoCorrect={false}
						/>
						{search.length > 0 && (
							<TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
								<IconSymbol name="xmark.circle.fill" size={20} color={Colors.tabIconDefault} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Results */}
				<View style={styles.resultsContainer}>
					{isLoading && search.length > 0 && (
						<View style={styles.centered}>
							<ActivityIndicator size="large" color={Colors.tint} />
							<Text style={styles.loadingText}>Searching...</Text>
						</View>
					)}

					{isError && (
						<View style={styles.centered}>
							<IconSymbol name="exclamationmark.triangle" size={48} color={Colors.tabIconDefault} />
							<Text style={styles.errorText}>
								{error?.message || "Failed to search people"}
							</Text>
						</View>
					)}

					{!isLoading && !isError && search.length === 0 && (
						<View style={styles.centered}>
							<IconSymbol name="person.circle" size={64} color={Colors.tabIconDefault} />
							<Text style={styles.emptyTitle}>Start typing to search</Text>
							<Text style={styles.emptySubtitle}>
								Type a name or email address to find people
							</Text>
						</View>
					)}

					{!isLoading && !isError && search.length > 0 && (
						<PersonList
							people={finalResults}
							selected={selected || []}
							onPersonPress={addOrRemovePerson}
							searchTerm={search}
							isValidEmail={isSearchValidEmail}
						/>
					)}
				</View>
			</View>
		</Modal>
	)
}

function SelectedPersonPill({ person, onRemove }: { person: Person; onRemove: () => void }) {
	return (
		<View style={styles.pill}>
			<Text style={styles.pillText} numberOfLines={1}>
				{person.display || person.name}
			</Text>
			<TouchableOpacity onPress={onRemove} style={styles.pillRemove}>
				<IconSymbol name="xmark" size={12} color={Colors.tint} />
			</TouchableOpacity>
		</View>
	)
}

export interface Person {
	id: string
	name: string
	display?: string
	type: string
	source: string
}

function PersonList(props: {
	people: Person[]
	selected?: Person[]
	onPersonPress?: (person: Person) => void
	searchTerm?: string
	isValidEmail?: boolean
}) {
	const { people, selected, searchTerm, isValidEmail } = props

	if (people.length === 0) {
		// Show option to add manual email if search is valid email
		if (searchTerm && isValidEmail) {
			const manualPerson = createPersonFromEmail(searchTerm)
			return (
				<ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
					<View style={styles.manualEmailSection}>
						<Text style={styles.manualEmailHeader}>Add email address</Text>
						<TouchableOpacity
							onPress={() => props.onPersonPress?.(manualPerson)}
							style={styles.manualEmailItem}
						>
							<View style={[styles.avatar, { backgroundColor: Colors.tint }]}>
								<IconSymbol name="envelope" size={20} color="white" />
							</View>
							<View style={styles.personInfo}>
								<Text style={styles.manualEmailText}>
									{searchTerm}
								</Text>
								<Text style={styles.manualEmailSubtext}>
									Add this email address
								</Text>
							</View>
							<IconSymbol name="plus" size={20} color={Colors.tint} />
						</TouchableOpacity>
					</View>
				</ScrollView>
			)
		}

		return (
			<View style={styles.centered}>
				<IconSymbol name="person.3" size={48} color={Colors.tabIconDefault} />
				<Text style={styles.noResultsText}>No people found</Text>
				<Text style={styles.noResultsSubtext}>
					Try a different search term or enter a valid email address
				</Text>
			</View>
		)
	}

	return (
		<ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
			{people.map((item, index) => {
				if (!item) return null
				const isSelected = selected?.find((p) => p.id === item.id)
				const displayName = item.display || item.name
				const isLastItem = index === people.length - 1
				const isManualEmail = item.source === "manual"

				return (
					<TouchableOpacity
						key={item.id}
						onPress={() => props.onPersonPress?.(item)}
						style={[
							styles.listItem,
							!isLastItem && styles.listItemBorder,
							isSelected && styles.listItemSelected,
							isManualEmail && styles.manualEmailListItem
						]}
					>
						{/* Avatar */}
						<View 
							style={[
								styles.avatar,
								{ backgroundColor: isSelected ? Colors.tint : Colors.tabIconDefault }
							]}
						>
							{isManualEmail ? (
								<IconSymbol name="envelope" size={16} color="white" />
							) : (
								<Text style={styles.avatarText}>
									{displayName.charAt(0).toUpperCase()}
								</Text>
							)}
						</View>

						{/* Person Info */}
						<View style={styles.personInfo}>
							<Text 
								style={[
									styles.personName,
									isSelected && styles.personNameSelected
								]}
								numberOfLines={1}
							>
								{displayName}
								{isManualEmail && (
									<Text style={styles.manualEmailBadge}> (email)</Text>
								)}
							</Text>
							{item.source && !isManualEmail && (
								<Text style={styles.personSource}>
									{item.source}
								</Text>
							)}
							{isManualEmail && (
								<Text style={styles.personSource}>
									Add this email address
								</Text>
							)}
						</View>

						{/* Selection Indicator */}
						{isSelected ? (
							<IconSymbol name="checkmark.circle.fill" size={24} color={Colors.tint} />
						) : isManualEmail ? (
							<IconSymbol name="plus" size={20} color={Colors.tint} />
						) : null}
					</TouchableOpacity>
				)
			})}
			{/* Bottom padding for last item */}
			<View style={styles.bottomPadding} />
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5',
		backgroundColor: 'white',
	},
	headerButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: Colors.text,
	},
	doneButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	doneButtonText: {
		color: 'white',
		fontWeight: '500',
	},
	selectedSection: {
		padding: 16,
		backgroundColor: '#f9f9f9',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5',
	},
	selectedLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
		marginBottom: 8,
	},
	pillsContainer: {
		flexDirection: 'row',
	},
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.tint + '20',
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 4,
		marginRight: 8,
		borderWidth: 1,
		borderColor: Colors.tint + '40',
	},
	pillText: {
		color: Colors.tint,
		fontWeight: '500',
		fontSize: 14,
	},
	pillRemove: {
		marginLeft: 8,
		padding: 4,
	},
	searchSection: {
		padding: 16,
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5',
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	searchInput: {
		flex: 1,
		marginLeft: 12,
		fontSize: 16,
		color: Colors.text,
	},
	clearButton: {
		padding: 4,
	},
	resultsContainer: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	loadingText: {
		marginTop: 8,
		color: '#666',
	},
	errorText: {
		marginTop: 8,
		textAlign: 'center',
		color: '#666',
	},
	emptyTitle: {
		marginTop: 16,
		fontSize: 18,
		fontWeight: '500',
		color: '#666',
	},
	emptySubtitle: {
		marginTop: 4,
		textAlign: 'center',
		color: '#999',
	},
	noResultsText: {
		marginTop: 8,
		color: '#666',
	},
	noResultsSubtext: {
		textAlign: 'center',
		color: '#999',
		fontSize: 14,
		marginTop: 4,
	},
	list: {
		flex: 1,
	},
	listItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	listItemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	listItemSelected: {
		backgroundColor: Colors.tint + '10',
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	avatarText: {
		color: 'white',
		fontWeight: '600',
		fontSize: 14,
	},
	personInfo: {
		flex: 1,
	},
	personName: {
		fontSize: 16,
		color: Colors.text,
	},
	personNameSelected: {
		fontWeight: '600',
		color: Colors.tint,
	},
	personSource: {
		fontSize: 14,
		color: '#666',
		marginTop: 2,
	},
	bottomPadding: {
		height: 16,
	},
	manualEmailSection: {
		padding: 16,
	},
	manualEmailHeader: {
		fontSize: 14,
		fontWeight: '600',
		color: Colors.tabIconDefault,
		marginBottom: 12,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	manualEmailItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: Colors.tint + '10',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.tint + '20',
	},
	manualEmailText: {
		fontSize: 16,
		fontWeight: '500',
		color: Colors.tint,
	},
	manualEmailSubtext: {
		fontSize: 14,
		color: Colors.tabIconDefault,
		marginTop: 2,
	},
	manualEmailListItem: {
		borderLeftWidth: 3,
		borderLeftColor: Colors.tint,
	},
	manualEmailBadge: {
		fontSize: 12,
		color: Colors.tabIconDefault,
		fontWeight: 'normal',
	},
})
