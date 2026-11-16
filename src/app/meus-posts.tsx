import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AppHeader } from "@/components/common/AppHeader";
import { PostCard } from "@/components/posts/PostCard";
import { getMyPosts } from "@/services/post.service";
import { Post } from "@/types/post";
import { colors, spacing, typography } from "@/theme";

export default function MyPostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyPosts();
      setPosts(response.data);
    } catch (err) {
      console.error("Erro ao carregar meus posts:", err);
      setError("Não foi possível carregar seus posts. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function handleOpenPost(post: Post) {
    router.push(`/posts/${post.id}`);
  }

  function handleCreatePost() {
    router.push("/posts/novo");
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.title}>Meus posts</Text>
              <Text style={styles.subtitle}>Gerencie suas publicações</Text>
            </View>

            <Text style={styles.count}>
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </Text>

            {posts.length > 0 && (
              <Pressable style={styles.createButton} onPress={handleCreatePost}>
                <Text style={styles.createButtonText}>+ Novo post</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : error ? (
            <View>
              <Text style={styles.message}>{error}</Text>
              <Text style={styles.retry} onPress={loadPosts}>
                Tentar novamente
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Você ainda não publicou nenhum post
              </Text>
              <Text style={styles.message}>
                Suas publicações aparecerão aqui.
              </Text>

              <Pressable style={styles.createButton} onPress={handleCreatePost}>
                <Text style={styles.createButtonText}>Criar post</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PostCard post={item} onPress={handleOpenPost} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  list: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },

  count: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: spacing.xxxl,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },

  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginTop: spacing.lg,
  },

  retry: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: "center",
    marginTop: spacing.md,
  },

  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.lg,
  },

  createButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
