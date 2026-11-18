import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CreateUserInput, UpdateUserInput, User, UserRole } from '@/types/user';
import { PasswordInput } from '@/components/common/PasswordInput';
import { colors, radius, spacing, typography } from '@/theme';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialUser?: User;
  fixedRole?: UserRole;
  loading?: boolean;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
}

export function UserForm({ mode, initialUser, fixedRole, loading = false, onSubmit }: UserFormProps) {
  const [name, setName] = useState(initialUser?.name ?? '');
  const [email, setEmail] = useState(initialUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(fixedRole ?? 'ALUNO');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit() {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length > 100) {
      setValidationError('Informe um nome com até 100 caracteres.');
      return;
    }

    if (!cleanEmail || cleanEmail.length > 150 || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidationError('Informe um e-mail válido com até 150 caracteres.');
      return;
    }

    if (mode === 'create' && !password) {
      setValidationError('Informe uma senha.');
      return;
    }

    if (password.length > 100) {
      setValidationError('A senha deve ter até 100 caracteres.');
      return;
    }

    setValidationError(null);

    if (mode === 'create') {
      onSubmit({ name: cleanName, email: cleanEmail, password, role: fixedRole ?? role });
      return;
    }

    onSubmit({
      name: cleanName,
      email: cleanEmail,
      ...(password ? { password } : {}),
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome completo"
          placeholderTextColor={colors.textSecondary}
          maxLength={100}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="usuario@email.com"
          placeholderTextColor={colors.textSecondary}
          maxLength={150}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{mode === 'create' ? 'Senha' : 'Nova senha (opcional)'}</Text>
        <PasswordInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={mode === 'create' ? 'Digite a senha' : '********'}
          placeholderTextColor={colors.textSecondary}
          maxLength={100}
          autoComplete="new-password"
          editable={!loading}
        />
        {mode === 'edit' && (
          <Text style={styles.helperText}>Preencha somente se quiser alterar sua senha.</Text>
        )}
      </View>

      {mode === 'create' && !fixedRole ? (
        <View style={styles.field}>
          <Text style={styles.label}>Perfil</Text>
          <View style={styles.roleOptions}>
            {(['ALUNO', 'PROFESSOR'] as const).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: role === option }}
                style={[styles.roleOption, role === option && styles.selectedRole]}
                onPress={() => setRole(option)}
                disabled={loading}
              >
                <Text style={[styles.roleOptionText, role === option && styles.selectedRoleText]}>
                  {option === 'ALUNO' ? 'Aluno' : 'Professor'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.label}>Perfil</Text>
          <View style={styles.readOnlyRole}>
            <Text style={styles.roleOptionText}>
              {(initialUser?.role ?? fixedRole) === 'PROFESSOR' ? 'Professor' : 'Aluno'}
            </Text>
          </View>
        </View>
      )}

      {validationError && <Text style={styles.errorText}>{validationError}</Text>}

      <Pressable
        style={({ pressed }) => [styles.submitButton, (pressed || loading) && styles.pressed]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={colors.white} /> : (
          <Text style={styles.submitText}>
            {mode === 'create' ? (fixedRole === 'ALUNO' ? 'Cadastrar aluno' : 'Cadastrar usuário') : 'Salvar alterações'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  roleOptions: { flexDirection: 'row', gap: spacing.sm },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  selectedRole: { borderColor: colors.primary, backgroundColor: '#F5E5FF' },
  roleOptionText: { color: colors.text, fontSize: typography.sizes.sm },
  selectedRoleText: { color: colors.primary, fontWeight: typography.weights.bold },
  readOnlyRole: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  errorText: { color: '#DC2626', fontSize: typography.sizes.sm },
  helperText: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  pressed: { opacity: 0.75 },
});
