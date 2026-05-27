import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, Coins, Edit3, FolderKanban, Loader2, Plus, Sparkles, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import { sprintService } from '@/services/sprintService';
import { userService } from '@/services/userService';
import { getApiErrorMessage } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import type { Project, Sprint, SprintStatus } from '@/types/api';
import { roleLabels, sprintStatusLabels, translateText } from '@/utils/labels';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserLink } from '@/components/users/UserLink';

const sprintStatuses: SprintStatus[] = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const canManageSprints = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
  const canDeleteProjects = currentUser?.role === 'ADMIN';

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.list,
  });

  const createProject = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      toast.success('Проект создан');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowProjectForm(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createProject.mutate({
      name: String(form.get('name') ?? ''),
      description: String(form.get('description') ?? ''),
    });
    e.currentTarget.reset();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Проекты и квесты</h1>
          <p className="text-sm text-muted-foreground">
            Проект содержит квесты-спринты, а каждый квест собирает свою команду участников.
          </p>
          {!canManageSprints && (
            <p className="mt-1 text-xs text-muted-foreground">
              Ваша роль: {currentUser?.role ? roleLabels[currentUser.role] : 'участник'}. Создавать и редактировать квесты могут только Quest Master и администраторы.
            </p>
          )}
        </div>
        {canManageSprints && (
          <Button onClick={() => setShowProjectForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Новый проект
          </Button>
        )}
      </div>

      {showProjectForm && canManageSprints && (
        <Card>
          <CardHeader>
            <CardTitle>Создать проект</CardTitle>
            <CardDescription>Например: «Разработка MVP QuestParty».</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateProject} className="grid gap-3 md:grid-cols-[1fr_1.5fr_auto]">
            <Input name="name" placeholder="Название проекта" required maxLength={150} />
            <Input name="description" placeholder="Описание" />
            <Button type="submit" disabled={createProject.isPending}>Создать</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} canManageSprints={canManageSprints} canDeleteProjects={canDeleteProjects} />
        ))}
        {!projects?.length && (
          <Card>
            <CardDescription>Нет доступных проектов.</CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, canManageSprints, canDeleteProjects }: { project: Project; canManageSprints: boolean; canDeleteProjects: boolean }) {
  const queryClient = useQueryClient();
  const [showSprintForm, setShowSprintForm] = useState(false);

  const { data: sprints } = useQuery({
    queryKey: ['sprints', project.id],
    queryFn: () => projectService.listSprints(project.id),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userService.list,
    enabled: canManageSprints,
  });

  const createSprint = useMutation({
    mutationFn: (data: { title: string; description: string; startDate: string; endDate: string; rewardCoins: number; rewardXp: number }) =>
      sprintService.create(project.id, data),
    onSuccess: () => {
      toast.success('Спринт создан');
      queryClient.invalidateQueries({ queryKey: ['sprints', project.id] });
      setShowSprintForm(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const addProjectMember = useMutation({
    mutationFn: (userId: number) => projectService.addMember(project.id, userId),
    onSuccess: () => toast.success('Участник добавлен в проект'),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteProject = useMutation({
    mutationFn: () => projectService.delete(project.id),
    onSuccess: () => {
      toast.success('Проект удалён');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleCreateSprint(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createSprint.mutate({
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      startDate: String(form.get('startDate') ?? ''),
      endDate: String(form.get('endDate') ?? ''),
      rewardCoins: Number(form.get('rewardCoins')) || 0,
      rewardXp: Number(form.get('rewardXp')) || 0,
    });
    e.currentTarget.reset();
  }

  function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const userId = Number(form.get('userId'));
    if (userId) addProjectMember.mutate(userId);
  }

  function handleDeleteProject() {
    if (window.confirm(`Удалить проект «${translateText(project.name)}» вместе со всеми квестами, задачами и чатом?`)) {
      deleteProject.mutate();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          {translateText(project.name)}
        </CardTitle>
        <CardDescription>{project.description ? translateText(project.description) : 'Без описания'} · владелец: <UserLink user={{ id: project.ownerId, displayName: project.ownerName }} /></CardDescription>
      </CardHeader>

      {canDeleteProjects && (
        <div className="mb-4">
          <Button size="sm" variant="destructive" onClick={handleDeleteProject} disabled={deleteProject.isPending}>
            <Trash2 className="h-4 w-4" />
            Удалить проект
          </Button>
        </div>
      )}

      {canManageSprints && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowSprintForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Квест
          </Button>
          <form onSubmit={handleAddMember} className="flex gap-2">
            <select name="userId" className="h-8 rounded-lg border border-card-border bg-black/30 px-2 text-xs">
              {users?.map((user) => (
                <option key={user.id} value={user.id}>{user.displayName}</option>
              ))}
            </select>
            <Button size="sm" variant="ghost" type="submit" disabled={addProjectMember.isPending}>
              <Users className="h-4 w-4" />
              Добавить в проект
            </Button>
          </form>
        </div>
      )}

      {showSprintForm && canManageSprints && (
        <form onSubmit={handleCreateSprint} className="mb-4 grid gap-3 rounded-lg border border-card-border bg-black/20 p-3">
          <Label>Новый квест-спринт</Label>
          <Input name="title" placeholder="Название квеста" required maxLength={150} />
          <Input name="description" placeholder="Описание цели" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="startDate" type="date" required />
            <Input name="endDate" type="date" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="rewardCoins" type="number" min={0} defaultValue={0} placeholder="Награда монетами за квест" />
            <Input name="rewardXp" type="number" min={0} defaultValue={0} placeholder="Награда опытом за квест" />
          </div>
          <p className="text-xs text-muted-foreground">Эта награда начисляется участникам команды один раз при завершении всего квеста. Награды за отдельные миссии настраиваются в канбане.</p>
          <Button type="submit" disabled={createSprint.isPending}>Создать спринт</Button>
        </form>
      )}

      <ul className="space-y-3">
        {sprints?.map((sprint) => (
          <SprintRow
            key={sprint.id}
            sprint={sprint}
            projectId={project.id}
            users={users ?? []}
            canManageSprints={canManageSprints}
          />
        ))}
        {!sprints?.length && <li className="text-sm text-muted-foreground">Квестов пока нет.</li>}
      </ul>
    </Card>
  );
}

function SprintRow({
  sprint,
  projectId,
  users,
  canManageSprints,
}: {
  sprint: Sprint;
  projectId: number;
  users: { id: number; displayName: string }[];
  canManageSprints: boolean;
}) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const [isEditing, setIsEditing] = useState(false);

  const invalidateSprints = () => queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });

  const start = useMutation({
    mutationFn: () => sprintService.start(sprint.id),
    onSuccess: invalidateSprints,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const complete = useMutation({
    mutationFn: () => sprintService.complete(sprint.id),
    onSuccess: async (updatedSprint) => {
      const coins = updatedSprint.rewardCoins ?? 0;
      const xp = updatedSprint.rewardXp ?? 0;
      const rewardText = coins > 0 || xp > 0
        ? `Участникам начислено: ${coins} монет, ${xp} опыта`
        : 'Для этого квеста награда за завершение не задана';
      toast.success(`Спринт завершён. ${rewardText}`);
      invalidateSprints();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      const profile = await authService.getProfile();
      setUser(profile);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: (data: { title: string; description: string; startDate: string; endDate: string; status: SprintStatus; rewardCoins: number; rewardXp: number }) =>
      sprintService.update(sprint.id, data),
    onSuccess: async (updatedSprint) => {
      toast.success(updatedSprint.status === 'COMPLETED' && updatedSprint.rewardClaimed ? 'Спринт обновлён, награда начислена' : 'Спринт обновлён');
      setIsEditing(false);
      invalidateSprints();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const profile = await authService.getProfile();
      setUser(profile);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => sprintService.delete(sprint.id),
    onSuccess: () => {
      toast.success('Спринт удалён');
      invalidateSprints();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const join = useMutation({
    mutationFn: () => sprintService.join(sprint.id),
    onSuccess: () => {
      toast.success('Вы вошли в команду квеста');
      invalidateSprints();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const addPartyMember = useMutation({
    mutationFn: (userId: number) => sprintService.addPartyMember(sprint.id, userId),
    onSuccess: () => {
      toast.success('Участник добавлен в команду квеста');
      invalidateSprints();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleAddParty(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const userId = Number(new FormData(e.currentTarget).get('userId'));
    if (userId) addPartyMember.mutate(userId);
  }

  function handleUpdateSprint(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    update.mutate({
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      startDate: String(form.get('startDate') ?? ''),
      endDate: String(form.get('endDate') ?? ''),
      rewardCoins: Number(form.get('rewardCoins')) || 0,
      rewardXp: Number(form.get('rewardXp')) || 0,
      status: String(form.get('status')) as SprintStatus,
    });
  }

  function handleDeleteSprint() {
    if (window.confirm(`Удалить спринт/квест «${translateText(sprint.title)}» вместе с задачами, командой и чатом?`)) {
      remove.mutate();
    }
  }

  return (
    <li className="rounded-lg border border-card-border bg-black/20 p-3">
      {isEditing ? (
        <form onSubmit={handleUpdateSprint} className="grid gap-3">
          <Label>Редактирование квеста</Label>
          <Input name="title" defaultValue={translateText(sprint.title)} placeholder="Название квеста" required maxLength={150} />
          <Input name="description" defaultValue={translateText(sprint.description)} placeholder="Описание цели" />
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="startDate" type="date" defaultValue={sprint.startDate} required />
            <Input name="endDate" type="date" defaultValue={sprint.endDate} required />
            <select name="status" defaultValue={sprint.status} className="h-10 rounded-lg border border-card-border bg-black/30 px-3 text-sm">
              {sprintStatuses.map((status) => (
                <option key={status} value={status}>{sprintStatusLabels[status]}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="rewardCoins" type="number" min={0} defaultValue={sprint.rewardCoins ?? 0} placeholder="Награда монетами за квест" />
            <Input name="rewardXp" type="number" min={0} defaultValue={sprint.rewardXp ?? 0} placeholder="Награда опытом за квест" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="submit" disabled={update.isPending}>Сохранить</Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Link to={`/sprints/${sprint.id}/kanban`} className="group flex-1">
              <div className="font-semibold group-hover:text-primary">{translateText(sprint.title)}</div>
              {sprint.description && <div className="mt-1 text-xs text-muted-foreground">{translateText(sprint.description)}</div>}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{sprintStatusLabels[sprint.status]}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {sprint.startDate} — {sprint.endDate}</span>
                <span className="inline-flex items-center gap-1"><Coins className="h-3 w-3" /> {sprint.rewardCoins ?? 0} монет</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> {sprint.rewardXp ?? 0} опыта</span>
                {sprint.rewardClaimed && <span className="text-success">награда за квест начислена</span>}
                <span>{sprint.partyMembers.length} участников команды</span>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2">
              {canManageSprints && sprint.status === 'PLANNED' && <Button size="sm" variant="secondary" onClick={() => start.mutate()}>Запустить</Button>}
              {canManageSprints && sprint.status === 'ACTIVE' && <Button size="sm" variant="accent" onClick={() => complete.mutate()}>Завершить квест</Button>}
              {canManageSprints && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4" />
                    Редактировать
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteSprint} disabled={remove.isPending}>
                    <Trash2 className="h-4 w-4" />
                    Удалить спринт
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => join.mutate()}>Вступить</Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sprint.partyMembers.map((member) => (
              <span key={member.id} className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted-foreground">
                <UserLink user={member} className="text-muted-foreground" />
              </span>
            ))}
          </div>
          {canManageSprints && (
            <form onSubmit={handleAddParty} className="mt-3 flex flex-wrap gap-2">
              <select name="userId" className="h-8 rounded-lg border border-card-border bg-black/30 px-2 text-xs">
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.displayName}</option>
                ))}
              </select>
              <Button size="sm" variant="ghost" type="submit" disabled={addPartyMember.isPending}>Добавить в команду</Button>
            </form>
          )}
        </>
      )}
    </li>
  );
}
