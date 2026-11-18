
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Href, useRouter } from 'expo-router';

import { colors, spacing, typography } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  showHome?: boolean;
}

export function AppHeader({ showHome = true }: AppHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  function goToPosts() {
    setMenuVisible(false);
    router.replace('/posts' as Href);
  }

  function goToProfile() {
    setMenuVisible(false);
    router.push('/perfil' as Href);
  }

  function goToMyPosts() {
    setMenuVisible(false);
    router.push('/meus-posts');
  }

  function goToUsers() {
    setMenuVisible(false);
    router.push((user?.role === 'ALUNO' ? '/alunos' : '/usuarios') as Href);
  }

  async function handleLogout() {
    setMenuVisible(false);
    await signOut();
    router.replace('/login');
  }

  return (
    <>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir para a listagem de posts"
          onPress={goToPosts}
        >
          <Text style={styles.logo}>Educa Blog</Text>
        </Pressable>

        {isAuthenticated ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
            accessibilityState={{ expanded: menuVisible }}
            style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
            <Text style={styles.menuButtonText}>Menu</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable
            style={styles.menuPanel}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.menuHeading}>
              <Text style={styles.menuTitle}>Menu</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
                onPress={() => setMenuVisible(false)}
              >
                <Text style={styles.closeButton}>Fechar</Text>
              </Pressable>
            </View>

            {showHome && <MenuItem label="Início" onPress={goToPosts} />}
            <MenuItem label="Meu perfil" onPress={goToProfile} />
            {user?.role === 'PROFESSOR' && (
              <>
                <MenuItem label="Meus posts" onPress={goToMyPosts} />
                <MenuItem label="Usuários" onPress={goToUsers} />
              </>
            )}
            {user?.role === 'ALUNO' && (
              <MenuItem label="Usuários" onPress={goToUsers} />
            )}
            <MenuItem label="Sair" onPress={handleLogout} destructive />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface MenuItemProps {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ label, onPress, destructive = false }: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={[styles.menuItemText, destructive && styles.destructiveText]}>
        {label}
      </Text>
    </Pressable>
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  menuIcon: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  menuButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
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

  overlay: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 68,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },

  menuPanel: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  menuHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  menuTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  closeButton: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    padding: spacing.xs,
  },

  menuItem: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  menuItemText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
  },

  destructiveText: { color: '#DC2626', fontWeight: typography.weights.bold },
  pressed: { opacity: 0.7 },
});
