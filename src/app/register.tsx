import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { register } from "@/services/auth.service";
import { UserRole } from "@/types/auth";
import { colors, spacing, radius, typography } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("ALUNO");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      Alert.alert("Cadastro realizado!", "Sua conta foi criada com sucesso.", [
        {
          text: "Continuar",
          onPress: async () => {
            try {
              await signIn({
                email: email.trim(),
                password,
              });

              router.replace(role === "PROFESSOR" ? "/meus-posts" : "/");
            } catch (error) {
              console.error("Erro ao autenticar após cadastro:", error);

              Alert.alert(
                "Cadastro realizado!",
                "Sua conta foi criada, mas não foi possível iniciar a sessão. Faça login para continuar.",
                [
                  {
                    text: "Ir para login",
                    onPress: () => router.replace("/login"),
                  },
                ],
              );
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      let message = "Não foi possível realizar o cadastro. Tente novamente.";

      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        if (Array.isArray(apiMessage)) {
          message = apiMessage.join("\n");
        } else if (typeof apiMessage === "string") {
          message = apiMessage;
        }
      }

      Alert.alert("Erro no cadastro", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Cadastre-se para acessar os conteúdos do Educa Blog."
    >
      <View style={styles.card}>
        <Text style={styles.required}>
          <Text style={styles.asterisk}>*</Text> Campos obrigatórios
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Maria Silva"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            editable={!loading}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail *</Text>
          <TextInput
            style={styles.input}
            placeholder="maria.silva@email.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite uma senha"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            secureTextEntry
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Perfil *</Text>

          <View style={styles.roleOptions}>
            <Pressable
              style={[
                styles.roleOption,
                role === "ALUNO" && styles.roleOptionSelected,
              ]}
              onPress={() => setRole("ALUNO")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "ALUNO" && styles.roleTextSelected,
                ]}
              >
                Aluno
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.roleOption,
                role === "PROFESSOR" && styles.roleOptionSelected,
              ]}
              onPress={() => setRole("PROFESSOR")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "PROFESSOR" && styles.roleTextSelected,
                ]}
              >
                Professor
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.replace("/login")}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>

          <Pressable
            style={[styles.button, loading && styles.disabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Cadastrar usuário</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já possui uma conta?</Text>

        <Pressable onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Entrar</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E8D9F2",
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    elevation: 2,
  },

  required: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
  },

  asterisk: {
    color: "#E53935",
  },

  field: {
    gap: spacing.sm,
  },

  label: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E8D9F2",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.white,
    fontSize: typography.sizes.sm,
  },

  roleOptions: {
    flexDirection: "row",
    gap: spacing.md,
  },

  roleOption: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#E8D9F2",
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F5E8FF",
  },

  roleText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  roleTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#E8D9F2",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  cancelText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xl,
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },

  link: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
