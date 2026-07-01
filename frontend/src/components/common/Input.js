import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  hint,
  icon,
  rightIcon,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
    onBlur?.();
  };

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: error
      ? Colors.error
      : interpolateColor(focusAnim.value, [0, 1], [Colors.glassBorder, Colors.primary])
  }));

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputWrapper, animatedBorder, error && styles.errorBorder]}>
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            (secureTextEntry || rightIcon) && styles.inputWithRightIcon,
            multiline && styles.multiline,
            disabled && styles.disabled,
            inputStyle
          ]}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
      {error ? (
        <Text style={styles.errorText}>⚠ {error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden'
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Typography.body,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 52
  },
  inputWithLeftIcon: { paddingLeft: 8 },
  inputWithRightIcon: { paddingRight: 8 },
  multiline: { height: undefined, minHeight: 100, paddingTop: 14, textAlignVertical: 'top' },
  disabled: { opacity: 0.5 },
  leftIcon: { paddingLeft: 16 },
  rightIcon: { paddingRight: 12 },
  errorBorder: { borderColor: Colors.error },
  errorText: { fontFamily: Typography.body, fontSize: 12, color: Colors.error, marginTop: 6, marginLeft: 4 },
  hintText: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginTop: 6, marginLeft: 4 },
  eyeIcon: { fontSize: 16 }
});

export default Input;
