import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PostCard } from "@/components/posts/PostCard";
import { getPosts } from "@/services/post.service";
import { Post } from "@/types/post";
import { colors, spacing, typography } from "@/theme";
import { router } from "expo-router";
import { AppHeader } from '@/components/common/AppHeader';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPosts();
      setPosts(response.data);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      setError("Não foi possível carregar os posts. Tente novamente.");
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
            <Text style={styles.title}>Posts recentes</Text>
            <Text style={styles.count}>{posts.length} posts</Text>
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
            <Text style={styles.message}>Nenhum post encontrado.</Text>
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

  /*header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },

  logo: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },

  subtitle: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },*/

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

  count: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
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
});
