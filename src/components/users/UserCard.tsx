import { Pressable, StyleSheet, Text, View } from 'react-native';

import { User } from '@/types/user';
import { colors, radius, spacing, typography } from '@/theme';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user.role === 'PROFESSOR' ? 'Professor' : 'Aluno'}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${user.name}`}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
            onPress={() => onEdit(user)}
          >
            <Text style={styles.editText}>Visualizar / editar</Text>
          </Pressable>
          {onDelete && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${user.name}`}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              onPress={() => onDelete(user)}
            >
              <Text style={styles.deleteText}>Excluir</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  content: { padding: spacing.lg, gap: spacing.md },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5E5FF',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roleText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  name: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  email: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  editText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteText: { color: '#DC2626', fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  pressed: { opacity: 0.75 },
});
