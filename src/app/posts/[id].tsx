
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { getPostById } from '@/services/post.service';
import { Post } from '@/types/post';
import { colors, spacing, radius, typography } from '@/theme';
import { AppHeader } from '@/components/common/AppHeader';

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadPost() {
    try {
      setLoading(true);
      setError(false);

      const data = await getPostById(Number(id));
      setPost(data);
    } catch (err) {
      console.error('Erro ao carregar post:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPost();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <AppHeader />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !post ? (
        <View style={styles.center}>
          <Text style={styles.message}>
            Não foi possível carregar este post.
          </Text>

          <Pressable onPress={loadPost}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.disciplineBadge}>
            <Text style={styles.disciplineText}>
              {post.discipline}
            </Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>

          <Text style={styles.metadata}>
            Por {post.author}
          </Text>

          <Text style={styles.metadata}>
            Publicado em{' '}
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.body}>{post.content}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /*header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },

  /*backButton: {
    color: colors.white,
    fontSize: typography.sizes.sm,
  },*/

  /*logo: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },*/

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },

  content: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  disciplineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5E5FF',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },

  disciplineText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },

  title: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },

  metadata: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },

  body: {
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: 26,
  },

  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
  },

  retry: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
  },
});
