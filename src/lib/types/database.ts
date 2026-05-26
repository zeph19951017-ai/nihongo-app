/**
 * 檔案用途：Supabase 資料庫型別定義
 * 對應 supabase/migrations/ 中所有資料表的結構
 * 若之後用 Supabase CLI 重新產出，請用產出的版本取代此檔
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// 難度等級
export type Difficulty = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

// 使用者角色
export type UserRole = 'teacher' | 'student'

// 題目類型
export type QuestionType = 'multiple_choice' | 'fill_blank' | 'matching'

// 標籤類型
export type TagType = 'level' | 'topic'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          updated_at?: string
        }
      }
      vocabulary: {
        Row: {
          id: string
          kana: string
          kanji: string | null
          meaning: string
          example_jp: string | null
          example_zh: string | null
          audio_url: string | null
          difficulty: Difficulty | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          kana: string
          kanji?: string | null
          meaning: string
          example_jp?: string | null
          example_zh?: string | null
          audio_url?: string | null
          difficulty?: Difficulty | null
          created_by: string
          created_at?: string
        }
        Update: {
          kana?: string
          kanji?: string | null
          meaning?: string
          example_jp?: string | null
          example_zh?: string | null
          audio_url?: string | null
          difficulty?: Difficulty | null
        }
      }
      grammar: {
        Row: {
          id: string
          pattern: string
          explanation: string
          examples: Json
          difficulty: Difficulty | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          pattern: string
          explanation: string
          examples?: Json
          difficulty?: Difficulty | null
          created_by: string
          created_at?: string
        }
        Update: {
          pattern?: string
          explanation?: string
          examples?: Json
          difficulty?: Difficulty | null
        }
      }
      questions: {
        Row: {
          id: string
          type: QuestionType
          question: string
          options: Json | null
          correct_answer: string
          related_vocab_id: string | null
          related_grammar_id: string | null
          difficulty: Difficulty | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          type: QuestionType
          question: string
          options?: Json | null
          correct_answer: string
          related_vocab_id?: string | null
          related_grammar_id?: string | null
          difficulty?: Difficulty | null
          created_by: string
          created_at?: string
        }
        Update: {
          type?: QuestionType
          question?: string
          options?: Json | null
          correct_answer?: string
          related_vocab_id?: string | null
          related_grammar_id?: string | null
          difficulty?: Difficulty | null
        }
      }
      lesson_packs: {
        Row: {
          id: string
          name: string
          description: string | null
          vocab_ids: string[]
          grammar_ids: string[]
          question_ids: string[]
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          vocab_ids?: string[]
          grammar_ids?: string[]
          question_ids?: string[]
          created_by: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          vocab_ids?: string[]
          grammar_ids?: string[]
          question_ids?: string[]
        }
      }
      study_progress: {
        Row: {
          id: string
          user_id: string
          vocab_id: string
          familiarity_level: number
          next_review_at: string
          review_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vocab_id: string
          familiarity_level?: number
          next_review_at?: string
          review_count?: number
          updated_at?: string
        }
        Update: {
          familiarity_level?: number
          next_review_at?: string
          review_count?: number
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          question_id: string
          is_correct: boolean
          user_answer: string
          answered_at: string
          session_id: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          is_correct: boolean
          user_answer: string
          answered_at?: string
          session_id?: string
        }
        Update: never
      }
      tags: {
        Row: {
          id: string
          name: string
          type: TagType
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: TagType
          color?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          type?: TagType
          color?: string | null
        }
      }
      vocabulary_tags: {
        Row: {
          vocab_id: string
          tag_id: string
        }
        Insert: {
          vocab_id: string
          tag_id: string
        }
        Update: never
      }
      grammar_tags: {
        Row: {
          grammar_id: string
          tag_id: string
        }
        Insert: {
          grammar_id: string
          tag_id: string
        }
        Update: never
      }
    }
  }
}

// 方便使用的型別別名
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
