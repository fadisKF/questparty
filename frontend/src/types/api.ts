export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'EMPLOYEE';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ShopCategory = 'MERCH' | 'VACATION_HOURS' | 'PROFILE_CUSTOMIZATION' | 'BADGE';
export type FulfillmentMethod = 'NOT_SELECTED' | 'PICKUP' | 'DELIVERY' | 'TIME_OFF_ACTIVATION' | 'PROFILE_CUSTOMIZATION_ACTIVATION';
export type PurchaseStatus = 'OWNED' | 'FULFILLMENT_REQUESTED' | 'TIME_OFF_ACTIVATED' | 'PROFILE_FRAME_ACTIVATED';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'SPRINT_STARTED'
  | 'SPRINT_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'PURCHASE_SUCCESS'
  | 'COMMENT_ADDED'
  | 'CHAT_MESSAGE'
  | 'LEVEL_UP';

export interface UserSummary {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
  level?: number;
  goldenAvatarFrameActive?: boolean;
}

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  level: number;
  experiencePoints: number;
  coins: number;
  avatarUrl?: string | null;
  bio?: string | null;
  goldenAvatarFrameActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role?: Role;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  ownerId: number;
  ownerName: string;
  active: boolean;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
}

export interface Sprint {
  id: number;
  projectId: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  rewardCoins: number;
  rewardXp: number;
  rewardClaimed: boolean;
  partyMembers: UserSummary[];
  createdAt: string;
}

export interface CreateSprintRequest {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  rewardCoins?: number;
  rewardXp?: number;
}

export interface UpdateSprintRequest {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  rewardCoins?: number;
  rewardXp?: number;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export interface AdminAdjustUserStatsRequest {
  coins?: number;
  experiencePoints?: number;
}

export interface Task {
  id: number;
  sprintId: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  rewardCoins: number;
  rewardXp: number;
  rewardClaimed: boolean;
  position: number;
  assignee?: UserSummary | null;
  deadline?: string | null;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  rewardCoins?: number;
  rewardXp?: number;
  assigneeId?: number | null;
  deadline?: string | null;
}

export interface MoveTaskRequest {
  status: TaskStatus;
  position: number;
}

export interface KanbanBoard {
  sprintId: number;
  columns: Record<TaskStatus, Task[]>;
}

export interface ChatMessage {
  id: number;
  sprintId: number;
  author: UserSummary;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  createdAt: string;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  iconUrl?: string | null;
  xpBonus: number;
  coinsBonus: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export interface ShopItem {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category: ShopCategory;
  active: boolean;
}

export interface CreateShopItemRequest {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category: ShopCategory;
}

export interface UpdateShopItemRequest extends CreateShopItemRequest {
  active: boolean;
}

export interface PurchaseRequest {
  shopItemId: number;
  quantity?: number;
}

export interface PurchaseFulfillmentRequest {
  fulfillmentMethod: FulfillmentMethod;
  fulfillmentComment?: string | null;
}

export interface Purchase {
  id: number;
  userId: number;
  userName: string;
  shopItem: ShopItem;
  quantity: number;
  totalPrice: number;
  fulfillmentMethod: FulfillmentMethod;
  status: PurchaseStatus;
  fulfillmentComment?: string | null;
  activatedAt?: string | null;
  createdAt: string;
}

export interface UserProfile {
  user: User;
  inventory: Purchase[];
  sprints: Sprint[];
  extendedView: boolean;
}

export interface Dashboard {
  totalTasksCompleted: number;
  userTasksCompleted: number;
  sprintProgressPercent: number;
  leaderboard: LeaderboardEntry[];
  currentUser: User;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  level: number;
  experiencePoints: number;
  coins: number;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}
