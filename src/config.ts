function getEnvVariable(value: string, name: string): string {
  if (!value) {
    throw new Error(`Variável de ambiente não configurada: ${name}`);
  }
  return value;
}

export const config = {
  supabase: {
    url: getEnvVariable(import.meta.env.VITE_SUPABASE_URL, "VITE_SUPABASE_URL"),
    anonKey: getEnvVariable(
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      "VITE_SUPABASE_ANON_KEY",
    ),
  },
};
