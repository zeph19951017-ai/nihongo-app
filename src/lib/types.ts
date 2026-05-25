/**
 * 檔案用途：全域 TypeScript 型別定義
 * 對應 00_主控文件.md 第五節的資料庫 Schema
 */

// 使用者角色
export type UserRole = 'teacher' | 'student'

// 難度等級
export type Difficulty = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

// 題目類型
export type QuestionType = 'multiple_choice' | 'fill_blank' | 'matching'

// 標籤類型
export type TagType = 'level' | 'topic'

// 使用者
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

// 單字
export interface Vocabulary {
  id: string
  kana: string
  kanji: string | null
  meaning: string
  example_jp: string | null
  example_zh: string | null
  audio_url: string | null
  difficulty: Difficulty
  created_by: string
  created_at: string
}

// 文法句型
export interface Grammar {
  id: string
  pattern: string
  explanation: string
  examples: { jp: string; zh: string }[]
  difficulty: Difficulty
  created_by: string
  created_at: string
}

// 題目
export interface Question {
  id: string
  type: QuestionType
  question: string
  options: string[] | null
  correct_answer: string
  related_vocab_id: string | null
  related_grammar_id: string | null
  difficulty: Difficulty
  created_by: string
  created_at: string
}

// 課程包
export interface LessonPack {
  id: string
  name: string
  description: string | null
  vocab_ids: string[]
  grammar_ids: string[]
  question_ids: string[]
  created_by: string
  created_at: string
}

// 學習進度
export interface StudyProgress {
  id: string
  user_id: string
  vocab_id: string
  familiarity_level: number // 0-5
  next_review_at: string
  review_count: number
  updated_at: string
}

// 答題紀錄
export interface QuizResult {
  id: string
  user_id: string
  question_id: string
  is_correct: boolean
  user_answer: string
  answered_at: string
  session_id: string
}

// 標籤
export interface Tag {
  id: string
  name: string
  type: TagType
  color: string | null
  created_at: string
}
