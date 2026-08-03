import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

// Simple deterministic hash to grid matrix for QR visual representation
const generateQRMatrix = (value = '', gridSize = 21) => {
  const matrix = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  
  // Draw finder patterns at top-left, top-right, bottom-left
  const addFinderPattern = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startRow + r][startCol + c] = true;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, gridSize - 7);
  addFinderPattern(gridSize - 7, 0);

  // Fill in data modules deterministically based on input value string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder patterns
      if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) {
        continue;
      }
      const charCode = value.charCodeAt((r * gridSize + c) % (value.length || 1)) || 0;
      matrix[r][c] = ((charCode + r + c + Math.abs(hash)) % 3) === 0;
    }
  }

  return matrix;
};

const QRCodeContainer = React.memo(({
  value = 'REDDROP-VERIFIED-CERTIFICATE',
  size = 180,
  color = Colors.textPrimary,
  backgroundColor = '#FFFFFF',
  showLabel = true,
  style
}) => {
  const gridSize = 21;
  const matrix = generateQRMatrix(value, gridSize);
  const cellSize = size / gridSize;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.qrWrapper, { width: size + 24, height: size + 24, backgroundColor }]}>
        <Svg width={size} height={size}>
          {matrix.map((row, r) =>
            row.map((cell, c) => (
              cell ? (
                <Rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill={color === Colors.textPrimary ? '#0A0A0F' : color}
                />
              ) : null
            ))
          )}
        </Svg>
      </View>

      {showLabel && (
        <Text style={styles.codeText} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md
  },
  qrWrapper: {
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  codeText: {
    fontFamily: Typography.mono,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    letterSpacing: 0.5
  }
});

export default QRCodeContainer;
