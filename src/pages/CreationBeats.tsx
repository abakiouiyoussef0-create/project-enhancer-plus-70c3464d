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
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';

const STATUS_OPTIONS: Status[] = ['In Progress', 'Finished', 'Ready to Send'];

const KEY_OPTIONS = [
  'C', 'Cm', 'C#', 'C#m',
  'D', 'Dm', 'D#', 'D#m',
  'E', 'Em',
  'F', 'Fm', 'F#', 'F#m',
  'G', 'Gm', 'G#', 'G#m',
  'A', 'Am', 'A#', 'A#m',
  'B', 'Bm',
];

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
    notes: '',
    is_placed: false,
    music_key: '',
    mix_rating: 5,
    arrangement_rating: 5,
    dope_rating: 5,
    instruments_used: undefined,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      style: '',
      bpm: undefined,
      mood: '',
      status: 'In Progress',
      notes: '',
      is_placed: false,
      music_key: '',
      mix_rating: 5,
      arrangement_rating: 5,
      dope_rating: 5,
      instruments_used: undefined,
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
        notes: beat.notes || '',
        is_placed: beat.is_placed,
        music_key: beat.music_key || '',
        mix_rating: beat.mix_rating ?? 5,
        arrangement_rating: beat.arrangement_rating ?? 5,
        dope_rating: beat.dope_rating ?? 5,
        instruments_used: beat.instruments_used || undefined,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) return;

    const mix = formData.mix_rating ?? 5;
    const arrangement = formData.arrangement_rating ?? 5;
    const dope = formData.dope_rating ?? 5;
    const quality_score = Number(((mix + arrangement + dope) / 3).toFixed(1));

    const payload: BeatInsert = {
      title: formData.title,
      style: formData.style || null,
      bpm: formData.bpm || null,
      mood: formData.mood || null,
      status: formData.status || 'In Progress',
      notes: formData.notes || null,
      is_placed: formData.is_placed ?? false,
      music_key: formData.music_key || null,
      mix_rating: mix,
      arrangement_rating: arrangement,
      dope_rating: dope,
      instruments_used: formData.instruments_used || null,
      quality_score,
    };

    if (editingBeat) {
      await updateBeat.mutateAsync({
        id: editingBeat.id,
        updates: payload,
      });
    } else {
      await createBeat.mutateAsync(payload);
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
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto pb-4">
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
                  <Label htmlFor="music_key">Key</Label>
                  <Select
                    value={formData.music_key || ''}
                    onValueChange={(value) => setFormData({ ...formData, music_key: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_OPTIONS.map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mix (1-10)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.mix_rating ?? 5]}
                      onValueChange={([value]) =>
                        setFormData({ ...formData, mix_rating: value })
                      }
                    />
                    <span className="w-8 text-right text-sm">
                      {formData.mix_rating ?? 5}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Arrangement (1-10)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.arrangement_rating ?? 5]}
                      onValueChange={([value]) =>
                        setFormData({ ...formData, arrangement_rating: value })
                      }
                    />
                    <span className="w-8 text-right text-sm">
                      {formData.arrangement_rating ?? 5}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dope (1-10)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.dope_rating ?? 5]}
                      onValueChange={([value]) =>
                        setFormData({ ...formData, dope_rating: value })
                      }
                    />
                    <span className="w-8 text-right text-sm">
                      {formData.dope_rating ?? 5}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instruments_used">
                    Melodies Used (optional, 1-50)
                  </Label>
                  <Input
                    id="instruments_used"
                    type="number"
                    min={1}
                    max={50}
                    value={formData.instruments_used ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instruments_used:
                          e.target.value === ''
                            ? undefined
                            : Math.min(50, Math.max(1, parseInt(e.target.value) || 1)),
                      })
                    }
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Final Score (avg):{' '}
                  {Number(
                    (
                      ((formData.mix_rating ?? 5) +
                        (formData.arrangement_rating ?? 5) +
                        (formData.dope_rating ?? 5)) /
                      3
                    ).toFixed(1),
                  )}
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
                  <TableHead className="text-primary-foreground font-bold">Key</TableHead>
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
                <TableCell>{beat.music_key || '-'}</TableCell>
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
