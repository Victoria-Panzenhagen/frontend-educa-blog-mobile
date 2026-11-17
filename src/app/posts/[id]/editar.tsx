
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common/AppHeader';
import { BottomActionBar } from '@/components/common/BottomActionBar';
import { PostForm } from '@/components/posts/PostForm';
import { getPostById, updatePost } from '@/services/post.service';
import { PostInput } from '@/types/post';
import { colors, spacing, typography } from '@/theme';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [initialValues, setInitialValues] = useState<PostInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const post = await getPostById(Number(id));

        setInitialValues({
          title: post.title,
          content: post.content,
          disciplineId: post.disciplineId,
        });
      } catch (error) {
        console.error('Erro ao carregar post:', error);

        Alert.alert(
          'Erro',
          'Não foi possível carregar o post para edição.',
          [
            {
              text: 'Voltar',
              onPress: () => router.back(),
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPost();
    }
  }, [id]);

  async function handleSubmit(data: PostInput) {
    try {
      setSaving(true);

      await updatePost(Number(id), data);

      Alert.alert(
        'Sucesso!',
        'Post atualizado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/meus-posts'),
          },
        ],
      );
    } catch (error) {
      console.error('Erro ao atualizar post:', error);

      Alert.alert(
        'Erro',
        'Não foi possível atualizar o post. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Editar post</Text>
        <Text style={styles.subtitle}>
          Atualize as informações da sua publicação.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : initialValues ? (
        <PostForm
          initialValues={initialValues}
          submitLabel="Salvar alterações"
          loading={saving}
          onSubmit={handleSubmit}
        />
      ) : null}
      <BottomActionBar label="Cancelar" onPress={() => router.replace('/meus-posts')} />
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
