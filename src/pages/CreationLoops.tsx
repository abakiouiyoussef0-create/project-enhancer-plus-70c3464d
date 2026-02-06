import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLoops, useCreateLoop, useUpdateLoop, useDeleteLoop } from '@/hooks/useLoops';
import type { Loop, LoopInsert, Status, Source, RoyaltyStatus } from '@/types/database';
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
const SOURCE_OPTIONS: Source[] = ['Original', 'Sampled'];

const KEY_OPTIONS = [
  'C', 'Cm', 'C#', 'C#m',
  'D', 'Dm', 'D#', 'D#m',
  'E', 'Em',
  'F', 'Fm', 'F#', 'F#m',
  'G', 'Gm', 'G#', 'G#m',
  'A', 'Am', 'A#', 'A#m',
  'B', 'Bm',
];

export default function CreationLoops() {
  const { data: loops = [], isLoading } = useLoops();
  const createLoop = useCreateLoop();
  const updateLoop = useUpdateLoop();
  const deleteLoop = useDeleteLoop();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoop, setEditingLoop] = useState<Loop | null>(null);
  const [formData, setFormData] = useState<Partial<LoopInsert>>({
    title: '',
    style: '',
    bpm: undefined,
    source: undefined,
    royalty_status: undefined,
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
      source: undefined,
      royalty_status: undefined,
      status: 'In Progress',
      notes: '',
      is_placed: false,
      music_key: '',
      mix_rating: 5,
      arrangement_rating: 5,
      dope_rating: 5,
      instruments_used: undefined,
    });
    setEditingLoop(null);
  };

  const handleOpenDialog = (loop?: Loop) => {
    if (loop) {
      setEditingLoop(loop);
      setFormData({
        title: loop.title,
        style: loop.style || '',
        bpm: loop.bpm || undefined,
        source: loop.source || undefined,
        royalty_status: loop.royalty_status || undefined,
        status: loop.status,
        notes: loop.notes || '',
        is_placed: loop.is_placed,
        music_key: loop.music_key || '',
        mix_rating: loop.mix_rating ?? 5,
        arrangement_rating: loop.arrangement_rating ?? 5,
        dope_rating: loop.dope_rating ?? 5,
        instruments_used: loop.instruments_used || undefined,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSourceChange = (source: Source) => {
    // Auto-set royalty status based on source
    const royalty_status: RoyaltyStatus = source === 'Original' ? 'Free' : 'Copyrights';
    setFormData({ ...formData, source, royalty_status });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) return;

    const mix = formData.mix_rating ?? 5;
    const arrangement = formData.arrangement_rating ?? 5;
    const dope = formData.dope_rating ?? 5;
    const quality_score = Number(((mix + arrangement + dope) / 3).toFixed(1));

    const payload: LoopInsert = {
      title: formData.title,
      style: formData.style || null,
      bpm: formData.bpm || null,
      source: formData.source || null,
      royalty_status: formData.royalty_status || null,
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

    if (editingLoop) {
      await updateLoop.mutateAsync({
        id: editingLoop.id,
        updates: payload,
      });
    } else {
      await createLoop.mutateAsync(payload);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loop?')) {
      await deleteLoop.mutateAsync(id);
    }
  };

  const togglePlaced = async (loop: Loop) => {
    await updateLoop.mutateAsync({
      id: loop.id,
      updates: { is_placed: !loop.is_placed },
    });
  };

  // Calculate display royalty status
  const getDisplayRoyalty = (loop: Loop) => {
    if (loop.source === 'Original') return 'Free';
    return loop.royalty_status || 'Copyrights';
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
          <h1 className="text-3xl font-bold lightning-glow">🔄 Creation Loops</h1>
          <p className="text-muted-foreground">Track and manage your loop productions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Loop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLoop ? 'Edit Loop' : 'Add New Loop'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Loop Name *</Label>
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
                    placeholder="e.g., Lo-Fi, Pop"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={handleSourceChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="royalty_status">Royalties</Label>
                  <Select
                    value={formData.royalty_status}
                    onValueChange={(value: RoyaltyStatus) => setFormData({ ...formData, royalty_status: value })}
                    disabled={formData.source === 'Original'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.source === 'Original' ? 'Free' : 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Copyrights">Copyrights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                {editingLoop ? 'Update Loop' : 'Create Loop'}
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
              <TableHead className="text-primary-foreground font-bold">Loop Name</TableHead>
              <TableHead className="text-primary-foreground font-bold">Style</TableHead>
              <TableHead className="text-primary-foreground font-bold">BPM</TableHead>
              <TableHead className="text-primary-foreground font-bold">Key</TableHead>
              <TableHead className="text-primary-foreground font-bold">Source</TableHead>
              <TableHead className="text-primary-foreground font-bold">Royalties</TableHead>
              <TableHead className="text-primary-foreground font-bold">Status</TableHead>
              <TableHead className="text-primary-foreground font-bold">Quality</TableHead>
              <TableHead className="text-primary-foreground font-bold">Placed</TableHead>
              <TableHead className="text-primary-foreground font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loops.map((loop, index) => (
              <TableRow
                key={loop.id}
                className={index % 2 === 0 ? 'bg-card/50' : 'bg-card/30'}
              >
                <TableCell>{format(new Date(loop.created_at), 'MM/dd/yyyy')}</TableCell>
                <TableCell className="font-medium">{loop.title}</TableCell>
                <TableCell>{loop.style || '-'}</TableCell>
                <TableCell>{loop.bpm || '-'}</TableCell>
                <TableCell>{loop.music_key || '-'}</TableCell>
                <TableCell>{loop.source || '-'}</TableCell>
                <TableCell>
                  <span className={getDisplayRoyalty(loop) === 'Free' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                    {getDisplayRoyalty(loop)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={loop.status} />
                </TableCell>
                <TableCell>
                  <span className={loop.quality_score && loop.quality_score > 7.5 ? 'text-primary font-bold' : ''}>
                    {loop.quality_score || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={loop.is_placed}
                    onCheckedChange={() => togglePlaced(loop)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(loop)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(loop.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {loops.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No loops yet. Create your first loop! 🔄
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
