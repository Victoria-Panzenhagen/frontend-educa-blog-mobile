import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { deletePost, getMyPosts } from "@/services/post.service";
import { Post } from "@/types/post";
import { colors, spacing, typography } from "@/theme";

export default function MyPostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function fetchPosts() {
      try {
        const response = await getMyPosts(page, 5);

        if (!isActive) return;

        setPosts(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err) {
        if (!isActive) return;

        console.error("Erro ao carregar meus posts:", err);
        setError("Não foi possível carregar seus posts. Tente novamente.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void fetchPosts();

    return () => {
      isActive = false;
    };
  }, [page, refreshKey]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  }

  function handleOpenPost(post: Post) {
    router.push(`/posts/${post.id}`);
  }

  function handleCreatePost() {
    router.push("/posts/novo");
  }

  function handleEditPost(post: Post) {
    router.push(`/posts/${post.id}/editar`);
  }

  function handleDeletePost(post: Post) {
    Alert.alert(
      "Excluir post",
      `Tem certeza de que deseja excluir "${post.title}"? Essa ação não poderá ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(post.id);

              const updatedTotal = Math.max(0, total - 1);
              const updatedTotalPages = Math.max(
                1,
                Math.ceil(updatedTotal / 5),
              );

              setTotal(updatedTotal);
              setTotalPages(updatedTotalPages);

              Alert.alert("Sucesso", "Post excluído com sucesso.");

              if (posts.length === 1 && page > 1) {
                setLoading(true);
                setError(null);
                setPage((current) => current - 1);
                return;
              }

              setPosts((currentPosts) =>
                currentPosts.filter((item) => item.id !== post.id),
              );
            } catch (err) {
              console.error("Erro ao excluir post:", err);

              Alert.alert(
                "Erro",
                "Não foi possível excluir o post. Tente novamente.",
              );
            }
          },
        },
      ],
    );
  }

  function handlePreviousPage() {
    if (page > 1) {
      setLoading(true);
      setError(null);
      setPage((current) => current - 1);
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      setLoading(true);
      setError(null);
      setPage((current) => current + 1);
    }
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
              {total} {total === 1 ? "post" : "posts"}
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
              <Text style={styles.retry} onPress={handleRetry}>
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
          <PostCard
            post={item}
            onPress={handleOpenPost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
        ListFooterComponent={
          !loading && !error ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageButton, page === 1 && styles.disabledButton]}
                onPress={handlePreviousPage}
                disabled={page === 1}
              >
                <Text style={styles.pageButtonText}>Anterior</Text>
              </Pressable>

              <Text style={styles.pageInfo}>
                Página {page} de {totalPages}
              </Text>

              <Pressable
                style={[
                  styles.pageButton,
                  page === totalPages && styles.disabledButton,
                ]}
                onPress={handleNextPage}
                disabled={page === totalPages}
              >
                <Text style={styles.pageButtonText}>Próxima</Text>
              </Pressable>
            </View>
          ) : undefined
        }
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

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },

  pageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },

  pageButtonText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  disabledButton: {
    opacity: 0.4,
  },

  pageInfo: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },
});
