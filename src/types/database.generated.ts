
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categorias": {
                  Row: {
                    "id": string,"loja_id": string,"modalidade": string,"nome": string,"situacao": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"loja_id": string,"modalidade": string,"nome": string,"situacao"?: string,"slug": string
                  }
                  Update: {
                    "id"?: string,"loja_id"?: string,"modalidade"?: string,"nome"?: string,"situacao"?: string,"slug"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categorias_loja_id_fkey"
      columns: ["loja_id"]
isOneToOne: false
      referencedRelation: "lojas"
      referencedColumns: ["id"]
    }
                  ]
                },"extras_servico": {
                  Row: {
                    "atualizado_em": string,"caminho_storage": string,"codigo_publico": string,"criado_em": string,"id": string,"item_id": string,"loja_id": string,"nome": string,"preco_minimo": number
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"caminho_storage": string,"codigo_publico": string,"criado_em"?: string,"id"?: string,"item_id": string,"loja_id": string,"nome": string,"preco_minimo": number
                  }
                  Update: {
                    "atualizado_em"?: string,"caminho_storage"?: string,"codigo_publico"?: string,"criado_em"?: string,"id"?: string,"item_id"?: string,"loja_id"?: string,"nome"?: string,"preco_minimo"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "extras_servico_item_fk"
      columns: ["item_id","loja_id"]
isOneToOne: false
      referencedRelation: "itens"
      referencedColumns: ["id","loja_id"]
    }
                  ]
                },"fotos": {
                  Row: {
                    "caminho_storage": string,"criado_em": string,"id": string,"item_id": string,"loja_id": string,"posicao": number,"principal": boolean,"tema_id": string | null,"texto_alternativo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "caminho_storage": string,"criado_em"?: string,"id"?: string,"item_id": string,"loja_id": string,"posicao": number,"principal"?: boolean,"tema_id"?: string | null,"texto_alternativo": string
                  }
                  Update: {
                    "caminho_storage"?: string,"criado_em"?: string,"id"?: string,"item_id"?: string,"loja_id"?: string,"posicao"?: number,"principal"?: boolean,"tema_id"?: string | null,"texto_alternativo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "fotos_item_fk"
      columns: ["item_id","loja_id"]
isOneToOne: false
      referencedRelation: "itens"
      referencedColumns: ["id","loja_id"]
    },{
      foreignKeyName: "fotos_tema_fk"
      columns: ["tema_id","loja_id"]
isOneToOne: false
      referencedRelation: "temas"
      referencedColumns: ["id","loja_id"]
    }
                  ]
                },"item_categorias": {
                  Row: {
                    "categoria_id": string,"item_id": string,"loja_id": string,"modalidade": string
                  }
                  ComputedFields: never
                  Insert: {
                    "categoria_id": string,"item_id": string,"loja_id": string,"modalidade": string
                  }
                  Update: {
                    "categoria_id"?: string,"item_id"?: string,"loja_id"?: string,"modalidade"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "item_categorias_categoria_fk"
      columns: ["categoria_id","loja_id","modalidade"]
isOneToOne: false
      referencedRelation: "categorias"
      referencedColumns: ["id","loja_id","modalidade"]
    },{
      foreignKeyName: "item_categorias_item_fk"
      columns: ["item_id","loja_id","modalidade"]
isOneToOne: false
      referencedRelation: "itens"
      referencedColumns: ["id","loja_id","modalidade"]
    }
                  ]
                },"itens": {
                  Row: {
                    "atualizado_em": string,"codigo_publico": string,"criado_em": string,"descricao": string,"em_destaque": boolean,"id": string,"loja_id": string,"modalidade": string,"preco_base": number,"preco_reposicao": number,"situacao": string,"tipo": string,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"codigo_publico": string,"criado_em"?: string,"descricao": string,"em_destaque"?: boolean,"id"?: string,"loja_id": string,"modalidade": string,"preco_base": number,"preco_reposicao": number,"situacao"?: string,"tipo": string,"titulo": string
                  }
                  Update: {
                    "atualizado_em"?: string,"codigo_publico"?: string,"criado_em"?: string,"descricao"?: string,"em_destaque"?: boolean,"id"?: string,"loja_id"?: string,"modalidade"?: string,"preco_base"?: number,"preco_reposicao"?: number,"situacao"?: string,"tipo"?: string,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "itens_loja_id_fkey"
      columns: ["loja_id"]
isOneToOne: false
      referencedRelation: "lojas"
      referencedColumns: ["id"]
    }
                  ]
                },"lojas": {
                  Row: {
                    "atualizado_em": string,"bairro": string | null,"capa_url": string | null,"cidade": string | null,"criado_em": string,"descricao": string | null,"email": string | null,"estado": string | null,"id": string,"logo_url": string | null,"nome_comercial": string,"situacao": string,"slug": string,"telefone": string | null,"usuario_id": string,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"bairro"?: string | null,"capa_url"?: string | null,"cidade"?: string | null,"criado_em"?: string,"descricao"?: string | null,"email"?: string | null,"estado"?: string | null,"id"?: string,"logo_url"?: string | null,"nome_comercial": string,"situacao"?: string,"slug": string,"telefone"?: string | null,"usuario_id": string,"whatsapp": string
                  }
                  Update: {
                    "atualizado_em"?: string,"bairro"?: string | null,"capa_url"?: string | null,"cidade"?: string | null,"criado_em"?: string,"descricao"?: string | null,"email"?: string | null,"estado"?: string | null,"id"?: string,"logo_url"?: string | null,"nome_comercial"?: string,"situacao"?: string,"slug"?: string,"telefone"?: string | null,"usuario_id"?: string,"whatsapp"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lojas_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: true
      referencedRelation: "usuarios"
      referencedColumns: ["id"]
    }
                  ]
                },"temas": {
                  Row: {
                    "codigo_publico": string,"criado_em": string,"id": string,"loja_id": string,"nome": string
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo_publico": string,"criado_em"?: string,"id"?: string,"loja_id": string,"nome": string
                  }
                  Update: {
                    "codigo_publico"?: string,"criado_em"?: string,"id"?: string,"loja_id"?: string,"nome"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "temas_loja_id_fkey"
      columns: ["loja_id"]
isOneToOne: false
      referencedRelation: "lojas"
      referencedColumns: ["id"]
    }
                  ]
                },"tokens_acesso": {
                  Row: {
                    "criado_em": string,"criado_por": string,"emitido_para": string,"expira_em": string,"id": string,"revogado_em": string | null,"token_hash": string,"usado_em": string | null,"usado_por": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "criado_em"?: string,"criado_por": string,"emitido_para": string,"expira_em": string,"id"?: string,"revogado_em"?: string | null,"token_hash": string,"usado_em"?: string | null,"usado_por"?: string | null
                  }
                  Update: {
                    "criado_em"?: string,"criado_por"?: string,"emitido_para"?: string,"expira_em"?: string,"id"?: string,"revogado_em"?: string | null,"token_hash"?: string,"usado_em"?: string | null,"usado_por"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "tokens_acesso_criado_por_fkey"
      columns: ["criado_por"]
isOneToOne: false
      referencedRelation: "usuarios"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tokens_acesso_usado_por_fkey"
      columns: ["usado_por"]
isOneToOne: false
      referencedRelation: "usuarios"
      referencedColumns: ["id"]
    }
                  ]
                },"usuarios": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"id": string,"nome": string,"papel": string,"situacao": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"id": string,"nome": string,"papel"?: string,"situacao"?: string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome"?: string,"papel"?: string,"situacao"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "tokens_acesso_admin": {
                  Row: {
                    "criado_em": string,"criado_por": string,"emitido_para": string,"expira_em": string,"id": string,"revogado_em": string | null,"usado_em": string | null,"usado_por": string | null
                  }
                  ComputedFields: never
                  Insert: {
                           "criado_em"?: string | null,"criado_por"?: string | null,"emitido_para"?: string | null,"expira_em"?: string | null,"id"?: string | null,"revogado_em"?: string | null,"usado_em"?: string | null,"usado_por"?: string | null
                         }
                        Update: {
                           "criado_em"?: string | null,"criado_por"?: string | null,"emitido_para"?: string | null,"expira_em"?: string | null,"id"?: string | null,"revogado_em"?: string | null,"usado_em"?: string | null,"usado_por"?: string | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "tokens_acesso_criado_por_fkey"
      columns: ["criado_por"]
isOneToOne: false
      referencedRelation: "usuarios"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tokens_acesso_usado_por_fkey"
      columns: ["usado_por"]
isOneToOne: false
      referencedRelation: "usuarios"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "gerar_codigo_publico":
{ Args: { "tamanho"?: number }; Returns: string
                           },
"usuario_e_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"usuario_e_dono_da_loja":
{ Args: { "p_loja_id": string }; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
