
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, spacing, typography } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  showHome?: boolean;
}

export function AppHeader({ showHome = true }: AppHeaderProps) {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Educa Blog</Text>

      <View style={styles.actions}>
        {showHome && (
          <Pressable onPress={() => router.replace('/')}>
            <Text style={styles.link}>Início</Text>
          </Pressable>
        )}

        {isAuthenticated ? (
          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },

  link: {
    color: colors.white,
    fontSize: typography.sizes.sm,
  },

  button: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },

  buttonText: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
});
