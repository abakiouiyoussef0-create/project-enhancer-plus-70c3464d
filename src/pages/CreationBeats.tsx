import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useBeats, useCreateBeat, useUpdateBeat, useDeleteBeat } from '@/hooks/useBeats';
import type { Beat, BeatInsert, Status } from '@/types/database';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const STATUS_OPTIONS: Status[] = ['In Progress', 'Finished', 'Ready to Send'];

export default function CreationBeats() {
  const { data: beats = [], isLoading } = useBeats();
  const createBeat = useCreateBeat();
  const updateBeat = useUpdateBeat();
  const deleteBeat = useDeleteBeat();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [formData, setFormData] = useState<Partial<BeatInsert>>({
    title: '',
    style: '',
    bpm: undefined,
    mood: '',
    status: 'In Progress',
    quality_score: undefined,
    notes: '',
    is_placed: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      style: '',
      bpm: undefined,
      mood: '',
      status: 'In Progress',
      quality_score: undefined,
      notes: '',
      is_placed: false,
    });
    setEditingBeat(null);
  };

  const handleOpenDialog = (beat?: Beat) => {
    if (beat) {
      setEditingBeat(beat);
      setFormData({
        title: beat.title,
        style: beat.style || '',
        bpm: beat.bpm || undefined,
        mood: beat.mood || '',
        status: beat.status,
        quality_score: beat.quality_score || undefined,
        notes: beat.notes || '',
        is_placed: beat.is_placed,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) return;

    if (editingBeat) {
      await updateBeat.mutateAsync({
        id: editingBeat.id,
        updates: formData,
      });
    } else {
      await createBeat.mutateAsync(formData as BeatInsert);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this beat?')) {
      await deleteBeat.mutateAsync(id);
    }
  };

  const togglePlaced = async (beat: Beat) => {
    await updateBeat.mutateAsync({
      id: beat.id,
      updates: { is_placed: !beat.is_placed },
    });
  };

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
          <h1 className="text-3xl font-bold lightning-glow">🎵 Creation Beats</h1>
          <p className="text-muted-foreground">Track and manage your beat productions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Beat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBeat ? 'Edit Beat' : 'Add New Beat'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Beat Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Input
                    id="style"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    placeholder="e.g., Trap, Drill"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bpm">BPM (60-200)</Label>
                  <Input
                    id="bpm"
                    type="number"
                    min={60}
                    max={200}
                    value={formData.bpm || ''}
                    onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Input
                    id="mood"
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    placeholder="e.g., Dark, Energetic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality_score">Quality Score (1-10)</Label>
                  <Input
                    id="quality_score"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.quality_score || ''}
                    onChange={(e) => setFormData({ ...formData, quality_score: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_placed"
                  checked={formData.is_placed}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_placed: !!checked })}
                />
                <Label htmlFor="is_placed">Placed</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingBeat ? 'Update Beat' : 'Create Beat'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header-purple border-b border-primary/30">
              <TableHead className="text-primary-foreground font-bold">Date</TableHead>
              <TableHead className="text-primary-foreground font-bold">Beat Name</TableHead>
              <TableHead className="text-primary-foreground font-bold">Style</TableHead>
              <TableHead className="text-primary-foreground font-bold">BPM</TableHead>
              <TableHead className="text-primary-foreground font-bold">Mood</TableHead>
              <TableHead className="text-primary-foreground font-bold">Status</TableHead>
              <TableHead className="text-primary-foreground font-bold">Quality</TableHead>
              <TableHead className="text-primary-foreground font-bold">Placed</TableHead>
              <TableHead className="text-primary-foreground font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beats.map((beat, index) => (
              <TableRow
                key={beat.id}
                className={index % 2 === 0 ? 'bg-card/50' : 'bg-card/30'}
              >
                <TableCell>{format(new Date(beat.created_at), 'MM/dd/yyyy')}</TableCell>
                <TableCell className="font-medium">{beat.title}</TableCell>
                <TableCell>{beat.style || '-'}</TableCell>
                <TableCell>{beat.bpm || '-'}</TableCell>
                <TableCell>{beat.mood || '-'}</TableCell>
                <TableCell>
                  <StatusBadge status={beat.status} />
                </TableCell>
                <TableCell>
                  <span className={beat.quality_score && beat.quality_score > 7.5 ? 'text-primary font-bold' : ''}>
                    {beat.quality_score || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={beat.is_placed}
                    onCheckedChange={() => togglePlaced(beat)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(beat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(beat.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {beats.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No beats yet. Create your first beat! ⚡
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
