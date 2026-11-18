import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, spacing } from '@/theme';

type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry'>;

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  function PasswordInput({ style, ...inputProps }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <View style={styles.container}>
        <TextInput
          {...inputProps}
          ref={ref}
          style={[style, styles.input]}
          secureTextEntry={!visible}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <View style={styles.eye}>
            <View style={styles.pupil} />
            {!visible && <View style={styles.slash} />}
          </View>
        </Pressable>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  input: {
    paddingRight: spacing.xxxl + spacing.lg,
  },
  toggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 20,
    height: 13,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  slash: {
    position: 'absolute',
    width: 24,
    height: 1.5,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: '-38deg' }],
  },
});
