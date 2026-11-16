
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Post } from '@/types/post';
import { colors, spacing, radius, typography } from '@/theme';

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export function PostCard({
  post,
  onPress,
  onEdit,
  onDelete,
}: PostCardProps) {
  const isManagementMode = !!onEdit || !!onDelete;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.disciplineBadge}>
          <Text style={styles.disciplineText}>
            {post.discipline}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {post.content}
        </Text>

        <Text style={styles.author}>
          Por <Text style={styles.authorName}>{post.author}</Text>
        </Text>

        {isManagementMode ? (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => onPress(post)}
            >
              <Text style={styles.buttonText}>Visualizar</Text>
            </Pressable>

            {onEdit && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => onEdit(post)}
              >
                <Text style={styles.editText}>Editar</Text>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => onDelete(post)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => onPress(post)}
          >
            <Text style={styles.buttonText}>Ler post</Text>
          </Pressable>
        )}
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

  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  disciplineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5E5FF',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  disciplineText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },

  title: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },

  author: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },

  authorName: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },

  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  editText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  deleteText: {
    color: '#DC2626',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
