export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type Priority = 'low' | 'medium' | 'high'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  due_date: string | null
  completed_at: string | null
  created_at: string
  categories?: Category
}

export interface LearningLog {
  id: string
  user_id: string
  task_id: string
  note: string | null
  time_spent_mins: number
  logged_date: string
  created_at: string
  tasks?: Task
}

export interface DailyStat {
  day: string
  completed: number
  time: number
}
