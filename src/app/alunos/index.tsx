import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Href, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common/AppHeader';
import { UserCard } from '@/components/users/UserCard';
import { useAuth } from '@/contexts/AuthContext';
import { deleteUser, getAllUsers } from '@/services/user.service';
import { User } from '@/types/user';
import { colors, radius, spacing, typography } from '@/theme';

const PAGE_SIZE = 5;

export default function StudentsScreen() {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setRefreshKey((current) => current + 1);
    }, []),
  );

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        setError(null);
        const allUsers = await getAllUsers(search);
        if (!active) return;

        const filtered = allUsers.filter((user) => user.role === 'ALUNO');
        const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (page > pages) {
          setPage(pages);
          return;
        }

        const start = (page - 1) * PAGE_SIZE;
        setStudents(filtered.slice(start, start + PAGE_SIZE));
        setTotal(filtered.length);
        setTotalPages(pages);
      } catch (err) {
        if (!active) return;
        console.error('Erro ao carregar alunos:', err);
        setError('Não foi possível carregar os alunos. Tente novamente.');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadStudents();
    return () => { active = false; };
  }, [page, search, refreshKey]);

  function handleSearch() {
    const nextSearch = searchInput.trim();
    setLoading(true);
    setPage(1);
    if (nextSearch === search) setRefreshKey((current) => current + 1);
    else setSearch(nextSearch);
  }

  function refresh() {
    setLoading(true);
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  }

  function openEdit(student: User) {
    router.push(`/alunos/${student.id}/editar` as Href);
  }

  function confirmDelete(student: User) {
    Alert.alert(
      'Excluir aluno',
      `Tem certeza de que deseja excluir ${student.name}? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(student.id);
              Alert.alert('Sucesso', 'Aluno excluído com sucesso.');
              setRefreshKey((current) => current + 1);
            } catch (err) {
              console.error('Erro ao excluir aluno:', err);
              Alert.alert('Erro', 'Não foi possível excluir o aluno. Tente novamente.');
            }
          },
        },
      ],
    );
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setLoading(true);
    setPage(nextPage);
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )}
        ListHeaderComponent={(
          <View style={styles.header}>
            <View style={styles.headingRow}>
              <View style={styles.heading}>
                <Text style={styles.title}>Alunos</Text>
                <Text style={styles.subtitle}>Consulte e gerencie cadastros de alunos</Text>
              </View>
              <Pressable
                style={styles.createButton}
                onPress={() => router.push('/alunos/novo' as Href)}
              >
                <Text style={styles.createButtonText}>+ Novo</Text>
              </Pressable>
            </View>
            <Text style={styles.count}>{total} {total === 1 ? 'aluno' : 'alunos'}</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Buscar por nome ou e-mail"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <Pressable style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </Pressable>
            </View>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.message}>{error}</Text>
                <Pressable onPress={refresh}>
                  <Text style={styles.retry}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : error ? undefined : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum aluno encontrado</Text>
            <Text style={styles.message}>Tente ajustar sua busca ou cadastre um aluno.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onEdit={openEdit}
            onDelete={item.id === currentUser?.id ? undefined : confirmDelete}
          />
        )}
        ListFooterComponent={!loading && !error && total > 0 ? (
          <View style={styles.pagination}>
            <Pressable
              style={[styles.pageButton, page === 1 && styles.disabled]}
              onPress={() => changePage(page - 1)}
              disabled={page === 1}
            >
              <Text style={styles.pageButtonText}>Anterior</Text>
            </Pressable>
            <Text style={styles.pageInfo}>Página {page} de {totalPages}</Text>
            <Pressable
              style={[styles.pageButton, page === totalPages && styles.disabled]}
              onPress={() => changePage(page + 1)}
              disabled={page === totalPages}
            >
              <Text style={styles.pageButtonText}>Próxima</Text>
            </Pressable>
          </View>
        ) : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xxl, paddingBottom: spacing.xxxl, flexGrow: 1 },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  heading: { flex: 1 },
  title: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: spacing.xs },
  count: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  createButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md },
  createButtonText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: typography.sizes.sm },
  searchButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md },
  searchButtonText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  loader: { marginTop: spacing.xxl },
  empty: { alignItems: 'center', marginTop: spacing.xxxl },
  emptyTitle: { color: colors.text, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, textAlign: 'center' },
  message: { color: colors.textSecondary, fontSize: typography.sizes.sm, textAlign: 'center', marginTop: spacing.md },
  retry: { color: colors.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, marginTop: spacing.md },
  errorBanner: { alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  pageButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md },
  pageButtonText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  disabled: { opacity: 0.4 },
  pageInfo: { color: colors.textSecondary, fontSize: typography.sizes.xs },
});
