import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';

interface DropdownSelectProps {
    selectedValue: string;
    onValueChange: (value: string) => void;
    options: string[];
    placeholder: string;
    icon?: any;
    style?: any;
    inputIconStyle?: any;
    textStyle?: any;
    placeholderColor?: string;
    textColor?: string;
}

export default function DropdownSelect({
    selectedValue,
    onValueChange,
    options,
    placeholder,
    icon,
    style,
    inputIconStyle,
    textStyle,
    placeholderColor = '#9CA3AF',
    textColor = '#111827',
}: DropdownSelectProps) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setModalVisible(true)}
                style={[styles.trigger, style]}
            >
                <View style={styles.leftContainer}>
                    {icon && <Icon as={icon} style={[styles.icon, inputIconStyle]} />}
                    <Text
                        style={[
                            styles.triggerText,
                            { color: selectedValue ? textColor : placeholderColor },
                            textStyle,
                        ]}
                    >
                        {selectedValue || placeholder}
                    </Text>
                </View>
                <Icon as={ICONS.ChevronDown} style={styles.chevron} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>{placeholder}</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Icon as={ICONS.X} style={styles.closeIcon} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.scrollList}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {options.map((option) => {
                                        const isSelected = selectedValue === option;
                                        return (
                                            <TouchableOpacity
                                                key={option}
                                                style={[
                                                    styles.optionItem,
                                                    isSelected && styles.optionItemSelected,
                                                ]}
                                                onPress={() => {
                                                    onValueChange(option);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        isSelected && styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {option}
                                                </Text>
                                                {isSelected && (
                                                    <Icon
                                                        as={ICONS.CheckCircle}
                                                        style={styles.checkIcon}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderColor: '#E9EAF4',
        borderWidth: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        color: '#6366F1',
        width: 18,
        height: 18,
        marginRight: 10,
    },
    triggerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    chevron: {
        color: '#6366F1',
        width: 16,
        height: 16,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // modern slate backdrop
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxHeight: '65%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingTop: 20,
        paddingBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
    },
    closeIcon: {
        color: '#9CA3AF',
        width: 20,
        height: 20,
    },
    scrollList: {
        paddingHorizontal: 8,
        marginTop: 8,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginVertical: 2,
        borderRadius: 12,
    },
    optionItemSelected: {
        backgroundColor: '#EEF2FF',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
    },
    optionTextSelected: {
        color: '#6366F1',
        fontWeight: '700',
    },
    checkIcon: {
        color: '#6366F1',
        width: 18,
        height: 18,
    },
});
