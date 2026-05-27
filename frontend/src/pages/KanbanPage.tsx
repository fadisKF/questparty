import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Coins, Loader2, MessageCircle, Plus, Send, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatService } from '@/services/chatService';
import { getApiErrorMessage } from '@/services/apiClient';
import { sprintService } from '@/services/sprintService';
import { taskService } from '@/services/taskService';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage, KanbanBoard, Sprint, Task, TaskPriority, TaskStatus } from '@/types/api';
import { sprintStatusLabels, taskPriorityLabels, translateText } from '@/utils/labels';
import { createStompClient, subscribeSprintChat } from '@/websocket/stompClient';
import { UserLink } from '@/components/users/UserLink';

const columns: { id: TaskStatus; title: string; hint: string }[] = [
  { id: 'BACKLOG', title: 'Бэклог', hint: 'Идеи и будущие миссии' },
  { id: 'TODO', title: 'К выполнению', hint: 'Готово к взятию' },
  { id: 'IN_PROGRESS', title: 'В походе', hint: 'Сейчас в работе' },
  { id: 'REVIEW', title: 'Проверка', hint: 'Нужна проверка' },
  { id: 'DONE', title: 'Выполнено', hint: 'Награда начисляется один раз' },
];

const priorityLabels = taskPriorityLabels;

export function KanbanPage() {
  const params = useParams();
  const sprintId = Number(params.sprintId);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);
  const canManageSprints = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';

  const { data: sprint, isLoading: sprintLoading } = useQuery({
    queryKey: ['sprint', sprintId],
    queryFn: () => sprintService.get(sprintId),
    enabled: Boolean(sprintId),
  });

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['kanban', sprintId],
    queryFn: () => taskService.kanban(sprintId),
    enabled: Boolean(sprintId),
  });

  const moveTask = useMutation({
    mutationFn: ({ taskId, status, position }: { taskId: number; status: TaskStatus; position: number }) =>
      taskService.move(taskId, { status, position }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['kanban', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const profile = await authService.getProfile();
      setUser(profile);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteSprint = useMutation({
    mutationFn: () => sprintService.delete(sprintId),
    onSuccess: () => {
      toast.success('Спринт удалён');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleDeleteSprint() {
    if (window.confirm('Удалить этот спринт/квест вместе с задачами, командой и чатом?')) {
      deleteSprint.mutate();
    }
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask.mutate({
      taskId: Number(draggableId),
      status: destination.droppableId as TaskStatus,
      position: destination.index,
    });
  }

  if (sprintLoading || boardLoading || !sprint || !board) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/projects" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            К проектам
          </Link>
          <h1 className="text-2xl font-bold">{sprint.title}</h1>
          <p className="text-sm text-muted-foreground">
            {sprint.description ? translateText(sprint.description) : 'Квест без описания'} · {sprintStatusLabels[sprint.status]} · {sprint.startDate} — {sprint.endDate}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Coins className="h-3 w-3" /> Награда за завершение: {sprint.rewardCoins ?? 0} монет</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> {sprint.rewardXp ?? 0} опыта</span>
            {sprint.rewardClaimed && <span className="text-success">награда уже начислена</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManageSprints && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSprint} disabled={deleteSprint.isPending}>
              <Trash2 className="h-4 w-4" />
              Удалить спринт
            </Button>
          )}
          {sprint.partyMembers.map((member) => (
            <span key={member.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <UserLink user={member} className="text-primary" />
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 overflow-hidden">
          <CreateTaskCard sprint={sprint} />
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-3 xl:grid-cols-5">
              {columns.map((column) => (
                <KanbanColumn key={column.id} column={column} board={board} />
              ))}
            </div>
          </DragDropContext>
        </div>
        <ChatPanel sprintId={sprintId} />
      </div>
    </div>
  );
}

function KanbanColumn({ column, board }: { column: { id: TaskStatus; title: string; hint: string }; board: KanbanBoard }) {
  const tasks = board.columns[column.id] ?? [];

  return (
    <Droppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[320px] rounded-xl border border-card-border bg-black/20 p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
        >
          <div className="mb-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{column.title}</h2>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">{tasks.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">{column.hint}</p>
          </div>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl border border-card-border bg-card p-3 shadow-lg transition-transform ${snapshot.isDragging ? 'scale-[1.02]' : ''}`}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{translateText(task.title)}</h3>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
              {priorityLabels[task.priority]}
            </span>
          </div>
          {task.description && <p className="mb-3 text-sm text-muted-foreground">{translateText(task.description)}</p>}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-accent">
              <Coins className="h-3 w-3" /> {task.rewardCoins}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
              <Sparkles className="h-3 w-3" /> {task.rewardXp} опыта
            </span>
            {task.rewardClaimed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-success">
                <ShieldCheck className="h-3 w-3" /> начислено
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{task.assignee ? <UserLink user={task.assignee} className="text-muted-foreground" /> : 'Без исполнителя'}</span>
            {task.deadline && <span>до {new Date(task.deadline).toLocaleDateString()}</span>}
          </div>
        </article>
      )}
    </Draggable>
  );
}

function CreateTaskCard({ sprint }: { sprint: Sprint }) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [open, setOpen] = useState(false);

  const createTask = useMutation({
    mutationFn: (form: FormData) => {
      const assigneeId = Number(form.get('assigneeId')) || null;
      const deadlineRaw = String(form.get('deadline') ?? '');
      return taskService.create(sprint.id, {
        title: String(form.get('title') ?? ''),
        description: String(form.get('description') ?? ''),
        status: String(form.get('status') ?? 'TODO') as TaskStatus,
        priority: String(form.get('priority') ?? 'MEDIUM') as TaskPriority,
        rewardCoins: Number(form.get('rewardCoins')) || 10,
        rewardXp: Number(form.get('rewardXp')) || 25,
        assigneeId,
        deadline: deadlineRaw ? `${deadlineRaw}T23:59:00` : null,
      });
    },
    onSuccess: async (createdTask) => {
      toast.success(createdTask.status === 'DONE' && createdTask.rewardClaimed ? 'Миссия добавлена, награда начислена' : 'Миссия добавлена');
      queryClient.invalidateQueries({ queryKey: ['kanban', sprint.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (createdTask.status === 'DONE') {
        const profile = await authService.getProfile();
        setUser(profile);
      }
      setOpen(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTask.mutate(new FormData(e.currentTarget));
    e.currentTarget.reset();
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Миссии квеста</CardTitle>
          <CardDescription>Перетаскивайте карточки между колонками канбана; при переносе в «Выполнено» начисляются опыт и монеты.</CardDescription>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Новая миссия
        </Button>
      </div>
      {open && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-lg border border-card-border bg-black/20 p-3 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label>Название</Label>
            <Input name="title" required maxLength={200} placeholder="Например: реализовать магазин наград" />
          </div>
          <Input name="description" placeholder="Описание" />
          <select name="assigneeId" className="h-10 rounded-lg border border-card-border bg-black/30 px-3 text-sm">
            <option value="">Без исполнителя</option>
            {sprint.partyMembers.map((member) => (
              <option key={member.id} value={member.id}>{member.displayName}</option>
            ))}
          </select>
          <select name="status" defaultValue="TODO" className="h-10 rounded-lg border border-card-border bg-black/30 px-3 text-sm">
            {columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
          </select>
          <select name="priority" defaultValue="MEDIUM" className="h-10 rounded-lg border border-card-border bg-black/30 px-3 text-sm">
            {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <Input name="rewardCoins" type="number" min={0} defaultValue={10} placeholder="Монеты" />
          <Input name="rewardXp" type="number" min={0} defaultValue={25} placeholder="Опыт" />
          <Input name="deadline" type="date" />
          <Button type="submit" disabled={createTask.isPending} className="lg:col-span-2">Создать миссию</Button>
        </form>
      )}
    </Card>
  );
}

function ChatPanel({ sprintId }: { sprintId: number }) {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', sprintId],
    queryFn: () => chatService.history(sprintId),
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) => chatService.send(sprintId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat', sprintId] }),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  useEffect(() => {
    const client = createStompClient(() => {
      subscribeSprintChat(client, sprintId, (body) => {
        const incoming = JSON.parse(body) as ChatMessage;
        queryClient.setQueryData<ChatMessage[]>(['chat', sprintId], (old = []) =>
          old.some((message) => message.id === incoming.id) ? old : [...old, incoming],
        );
      });
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [queryClient, sprintId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const content = String(new FormData(form).get('content') ?? '').trim();
    if (!content) return;
    sendMessage.mutate(content);
    form.reset();
  }

  return (
    <Card className="flex max-h-[760px] min-h-[520px] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Чат команды
        </CardTitle>
        <CardDescription>Коммуникация внутри команды текущего квеста.</CardDescription>
      </CardHeader>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div key={message.id} className="rounded-lg bg-black/20 p-3">
            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <UserLink user={message.author} />
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        {!messages.length && <p className="text-sm text-muted-foreground">Сообщений пока нет. Напишите первое.</p>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input name="content" placeholder="Сообщение для команды..." autoComplete="off" />
        <Button type="submit" size="icon" disabled={sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
