import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { deleteUser, getAllUsers, getUsers } from '@/services/user.service';
import { User, UserRole } from '@/types/user';
import { colors, radius, spacing, typography } from '@/theme';

type RoleFilter = 'TODOS' | UserRole;
const PAGE_SIZE = 10;

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('TODOS');
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

    async function loadUsers() {
      try {
        setError(null);
        if (roleFilter === 'TODOS') {
          const response = await getUsers(page, PAGE_SIZE, search);
          if (!active) return;
          if (page > Math.max(1, response.totalPages)) {
            setPage(Math.max(1, response.totalPages));
            return;
          }
          setUsers(response.data);
          setTotal(response.total);
          setTotalPages(Math.max(1, response.totalPages));
        } else {
          const allUsers = await getAllUsers(search);
          if (!active) return;
          const filteredUsers = allUsers.filter((user) => user.role === roleFilter);
          const filteredPageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
          if (page > filteredPageCount) {
            setPage(filteredPageCount);
            return;
          }
          const start = (page - 1) * PAGE_SIZE;
          setUsers(filteredUsers.slice(start, start + PAGE_SIZE));
          setTotal(filteredUsers.length);
          setTotalPages(Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE)));
        }
      } catch (err) {
        if (!active) return;
        console.error('Erro ao carregar usuários:', err);
        setError('Não foi possível carregar os usuários. Tente novamente.');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadUsers();
    return () => { active = false; };
  }, [page, roleFilter, search, refreshKey]);

  const roleLabel = useMemo(() => {
    if (roleFilter === 'PROFESSOR') return 'Professores';
    if (roleFilter === 'ALUNO') return 'Alunos';
    return 'Todos';
  }, [roleFilter]);

  function refresh() {
    setLoading(true);
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  }

  function handleSearch() {
    const nextSearch = searchInput.trim();
    setLoading(true);
    setPage(1);
    if (nextSearch === search) {
      setRefreshKey((current) => current + 1);
    } else {
      setSearch(nextSearch);
    }
  }

  function changeFilter(filter: RoleFilter) {
    setLoading(true);
    setPage(1);
    setRoleFilter(filter);
  }

  function openEdit(user: User) {
    router.push(`/usuarios/${user.id}/editar` as Href);
  }

  function confirmDelete(user: User) {
    Alert.alert(
      'Excluir usuário',
      `Tem certeza de que deseja excluir ${user.name}? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso.');
              setRefreshKey((current) => current + 1);
            } catch (err) {
              console.error('Erro ao excluir usuário:', err);
              Alert.alert('Erro', 'Não foi possível excluir o usuário. Tente novamente.');
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
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headingRow}>
              <View style={styles.heading}>
                <Text style={styles.title}>Usuários</Text>
                <Text style={styles.subtitle}>Gerencie os usuários cadastrados</Text>
              </View>
              <Pressable style={styles.createButton} onPress={() => router.push('/usuarios/novo' as Href)}>
                <Text style={styles.createButtonText}>+ Novo</Text>
              </Pressable>
            </View>
            <Text style={styles.count}>{total} {total === 1 ? 'usuário' : 'usuários'} · {roleLabel}</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.search, styles.searchInput]}
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
            <View style={styles.filters}>
              {([
                ['TODOS', 'Todos'],
                ['PROFESSOR', 'Professores'],
                ['ALUNO', 'Alunos'],
              ] as const).map(([value, label]) => (
                <Pressable
                  key={value}
                  style={[styles.filter, roleFilter === value && styles.activeFilter]}
                  onPress={() => changeFilter(value)}
                >
                  <Text style={[styles.filterText, roleFilter === value && styles.activeFilterText]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.message}>{error}</Text>
                <Pressable onPress={refresh}><Text style={styles.retry}>Tentar novamente</Text></Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={styles.loader} /> : error ? (
            <View style={styles.empty}>
              <Text style={styles.message}>{error}</Text>
              <Pressable onPress={refresh}><Text style={styles.retry}>Tentar novamente</Text></Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
              <Text style={styles.message}>Tente ajustar a busca ou o filtro selecionado.</Text>
            </View>
          )
        }
        renderItem={({ item }) => <UserCard user={item} onEdit={openEdit} onDelete={confirmDelete} />}
        ListFooterComponent={!loading && !error && total > 0 ? (
          <View style={styles.pagination}>
            <Pressable style={[styles.pageButton, page === 1 && styles.disabled]} onPress={() => changePage(page - 1)} disabled={page === 1}>
              <Text style={styles.pageButtonText}>Anterior</Text>
            </Pressable>
            <Text style={styles.pageInfo}>Página {page} de {totalPages}</Text>
            <Pressable style={[styles.pageButton, page === totalPages && styles.disabled]} onPress={() => changePage(page + 1)} disabled={page === totalPages}>
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
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: typography.sizes.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1 },
  searchButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md },
  searchButtonText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  filters: { flexDirection: 'row', gap: spacing.sm },
  filter: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  activeFilter: { backgroundColor: '#F5E5FF', borderColor: colors.primary },
  filterText: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  activeFilterText: { color: colors.primary, fontWeight: typography.weights.bold },
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
