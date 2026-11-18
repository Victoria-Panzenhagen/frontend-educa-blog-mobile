
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common/AppHeader';
import { PostForm } from '@/components/posts/PostForm';
import { createPost } from '@/services/post.service';
import { PostInput } from '@/types/post';
import { colors, spacing, typography } from '@/theme';

export default function NewPostScreen() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: PostInput) {
    try {
      setLoading(true);

      await createPost(data);

      Alert.alert(
        'Sucesso!',
        'Post publicado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/meus-posts'),
          },
        ],
      );
    } catch (error) {
      console.error('Erro ao criar post:', error);

      Alert.alert(
        'Erro',
        'Não foi possível publicar o post. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Novo post</Text>
        <Text style={styles.subtitle}>
          Compartilhe seus conhecimentos com os alunos.
        </Text>
      </View>

      <PostForm
        submitLabel="Publicar post"
        loading={loading}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
