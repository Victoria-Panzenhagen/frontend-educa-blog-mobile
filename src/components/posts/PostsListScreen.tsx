import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { PostCard } from "@/components/posts/PostCard";
import { AppHeader } from "@/components/common/AppHeader";
import { getPosts, searchPosts } from "@/services/post.service";
import { Post } from "@/types/post";
import { colors, spacing, radius, typography } from "@/theme";

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function fetchPosts() {
      try {
        const response = appliedSearch
          ? await searchPosts(appliedSearch, page, 5)
          : await getPosts(page, 5);

        if (!isActive) return;

        setPosts(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err) {
        if (!isActive) return;

        console.error("Erro ao carregar posts:", err);
        setError("Não foi possível carregar os posts. Tente novamente.");
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
  }, [appliedSearch, page, refreshKey]);

  function handleSearch() {
    setLoading(true);
    setError(null);
    setPage(1);
    setAppliedSearch(searchTerm.trim());
  }

  function handleClearSearch() {
    setLoading(true);
    setError(null);
    setSearchTerm("");
    setAppliedSearch("");
    setPage(1);
  }

  function handleRetry() {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  }

  function handleOpenPost(post: Post) {
    router.push(`/posts/${post.id}`);
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
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        ListHeaderComponent={
          <View>
            <View style={styles.listHeader}>
              <Text style={styles.title}>Posts recentes</Text>
              <Text style={styles.count}>
                {total} {total === 1 ? "post" : "posts"}
              </Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Buscar por título ou conteúdo..."
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />

              {searchTerm.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={handleClearSearch}
                >
                  <Text style={styles.clearButtonText}>Limpar</Text>
                </Pressable>
              )}

              <Pressable style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </Pressable>
            </View>

            {appliedSearch.length > 0 && (
              <Text style={styles.searchInfo}>
                Resultados para: &quot;{appliedSearch}&quot;
              </Text>
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
            <Text style={styles.message}>
              {appliedSearch
                ? "Nenhum post encontrado para essa pesquisa."
                : "Nenhum post encontrado."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <PostCard post={item} onPress={handleOpenPost} />
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

  count: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },

  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
  },

  searchButtonText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  clearButton: {
    paddingHorizontal: spacing.xs,
  },

  clearButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  searchInfo: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.lg,
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
    borderRadius: radius.md,
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
