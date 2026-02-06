import { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { usePlanning, useCreateTask, useUpdateTask, useDeleteTask, useToggleTaskComplete } from '@/hooks/usePlanning';
import type { Planning, PlanningInsert, Focus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FOCUS_OPTIONS: Focus[] = ['Beats', 'Loops', 'Mixing'];

export default function WeeklyPlanning() {
  const { data: tasks = [], isLoading } = usePlanning();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Planning | null>(null);
  const [formData, setFormData] = useState<Partial<PlanningInsert>>({
    day: 'Monday',
    task_name: '',
    focus: undefined,
    style_focus: '',
    planned_time: undefined,
    is_completed: false,
  });

  const resetForm = () => {
    setFormData({
      day: 'Monday',
      task_name: '',
      focus: undefined,
      style_focus: '',
      planned_time: undefined,
      is_completed: false,
    });
    setEditingTask(null);
  };

  const handleOpenDialog = (task?: Planning) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        day: task.day,
        task_name: task.task_name,
        focus: task.focus || undefined,
        style_focus: task.style_focus || '',
        planned_time: task.planned_time || undefined,
        is_completed: task.is_completed,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.task_name || !formData.day) return;

    if (editingTask) {
      await updateTask.mutateAsync({
        id: editingTask.id,
        updates: formData,
      });
    } else {
      await createTask.mutateAsync(formData as PlanningInsert);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(id);
    }
  };

  const handleToggleComplete = async (task: Planning) => {
    await toggleComplete.mutateAsync({
      id: task.id,
      is_completed: !task.is_completed,
    });
  };

  // Calculate weekly dominance %
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const weeklyDominance = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Group tasks by day
  const tasksByDay = DAYS.reduce((acc, day) => {
    acc[day] = tasks.filter((t) => t.day === day);
    return acc;
  }, {} as Record<string, Planning[]>);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-thunder-strike">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold lightning-glow">📅 The Ritual</h1>
          <p className="text-muted-foreground">Weekly planning and workflow management</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto pb-4">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => setFormData({ ...formData, day: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task_name">Main Task *</Label>
                <Input
                  id="task_name"
                  value={formData.task_name}
                  onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                  required
                  placeholder="e.g., Cook up 5 Dark melodies"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="focus">Focus</Label>
                  <Select
                    value={formData.focus}
                    onValueChange={(value: Focus) => setFormData({ ...formData, focus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select focus" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOCUS_OPTIONS.map((focus) => (
                        <SelectItem key={focus} value={focus}>
                          {focus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planned_time">Planned Time (hrs)</Label>
                  <Input
                    id="planned_time"
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={formData.planned_time || ''}
                    onChange={(e) => setFormData({ ...formData, planned_time: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style_focus">Style Focus</Label>
                <Input
                  id="style_focus"
                  value={formData.style_focus}
                  onChange={(e) => setFormData({ ...formData, style_focus: e.target.value })}
                  placeholder="e.g., Dark Trap, Lo-Fi"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Dominance Progress */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Weekly Dominance</h3>
          <span className={`text-2xl font-bold ${weeklyDominance === 100 ? 'lightning-glow text-primary' : ''}`}>
            {weeklyDominance.toFixed(0)}%
            {weeklyDominance === 100 && ' 🏆'}
          </span>
        </div>
        <Progress value={weeklyDominance} className="h-4" />
        <p className="text-sm text-muted-foreground mt-2">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      {/* Tasks by Day */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS.map((day) => {
          const dayTasks = tasksByDay[day];
          return (
            <div key={day} className="glass-card rounded-xl p-4">
              <h4 className="text-lg font-bold mb-3 text-primary">{day}</h4>
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${task.is_completed ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-border'}`}
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task_name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.focus && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                              {task.focus}
                            </span>
                          )}
                          {task.style_focus && (
                            <span className="text-xs px-2 py-0.5 rounded bg-secondary/20 text-secondary">
                              {task.style_focus}
                            </span>
                          )}
                          {task.planned_time && (
                            <span className="text-xs text-muted-foreground">
                              {task.planned_time}h
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleOpenDialog(task)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
