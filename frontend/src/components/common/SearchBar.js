import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const SearchBar = React.memo(({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search donors, hospitals, camps...',
  style,
  inputStyle
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={[styles.input, inputStyle]}
        accessible={true}
        accessibilityLabel="Search input"
        accessibilityRole="search"
      />
      {Boolean(value && value.length > 0) && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginVertical: Spacing.xs
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Typography.body,
    fontSize: 15,
    paddingVertical: 0
  },
  clearBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearIcon: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default SearchBar;
