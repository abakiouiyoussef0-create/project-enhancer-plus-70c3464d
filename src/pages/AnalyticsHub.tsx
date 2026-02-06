import { useState } from 'react';
import { useBeats } from '@/hooks/useBeats';
import { useLoops } from '@/hooks/useLoops';
import { usePlanning } from '@/hooks/usePlanning';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CHART_COLORS = [
  'hsl(271, 76%, 53%)',   // Primary purple
  'hsl(189, 100%, 50%)',  // Secondary blue
  'hsl(120, 100%, 50%)',  // Green
  'hsl(60, 100%, 50%)',   // Yellow
  'hsl(240, 100%, 50%)',  // Blue
  'hsl(330, 80%, 60%)',   // Pink
];

export default function AnalyticsHub() {
  const { data: beats = [], isLoading: beatsLoading } = useBeats();
  const { data: loops = [], isLoading: loopsLoading } = useLoops();
  const { data: planning = [], isLoading: planningLoading } = usePlanning();

  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

  const isLoading = beatsLoading || loopsLoading || planningLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  // === Chart Data Calculations ===

  // Daily / weekly production trend
  const today = new Date();
  const startDate =
    timeRange === 'week'
      ? startOfWeek(today, { weekStartsOn: 1 })
      : new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate =
    timeRange === 'week'
      ? endOfWeek(today, { weekStartsOn: 1 })
      : new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const trendData: { label: string; beats: number; loops: number }[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = format(cursor, 'yyyy-MM-dd');
    const label = timeRange === 'week' ? format(cursor, 'EEE') : format(cursor, 'dd');

    const beatsCount = beats.filter(
      (b) => format(new Date(b.created_at), 'yyyy-MM-dd') === key,
    ).length;
    const loopsCount = loops.filter(
      (l) => format(new Date(l.created_at), 'yyyy-MM-dd') === key,
    ).length;

    trendData.push({
      label,
      beats: beatsCount,
      loops: loopsCount,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  // Status distribution
  const beatStatusData = [
    { name: 'In Progress', value: beats.filter((b) => b.status === 'In Progress').length },
    { name: 'Finished', value: beats.filter((b) => b.status === 'Finished').length },
    { name: 'Ready to Send', value: beats.filter((b) => b.status === 'Ready to Send').length },
  ];

  const loopStatusData = [
    { name: 'In Progress', value: loops.filter((l) => l.status === 'In Progress').length },
    { name: 'Finished', value: loops.filter((l) => l.status === 'Finished').length },
    { name: 'Ready to Send', value: loops.filter((l) => l.status === 'Ready to Send').length },
  ];

  // Quality > 7.5
  const beatsHighQuality = beats.filter((b) => (b.quality_score || 0) > 7.5).length;
  const beatsLowQuality = beats.length - beatsHighQuality;
  const loopsHighQuality = loops.filter((l) => (l.quality_score || 0) > 7.5).length;
  const loopsLowQuality = loops.length - loopsHighQuality;

  const qualityThresholdData = [
    { name: 'Beats > 7.5', high: beatsHighQuality, low: beatsLowQuality },
    { name: 'Loops > 7.5', high: loopsHighQuality, low: loopsLowQuality },
  ];

  // Royalties distribution
  const freeLoops = loops.filter((l) => l.royalty_status === 'Free' || l.source === 'Original').length;
  const copyrightLoops = loops.filter((l) => l.royalty_status === 'Copyrights' && l.source !== 'Original').length;
  const royaltiesData = [
    { name: 'Free', value: freeLoops },
    { name: 'Copyrights', value: copyrightLoops },
  ];

  // Placement data
  const beatsPlaced = beats.filter((b) => b.is_placed).length;
  const loopsPlaced = loops.filter((l) => l.is_placed).length;
  const placementData = [
    { name: 'Beats Placed', value: beatsPlaced },
    { name: 'Beats Not Placed', value: beats.length - beatsPlaced },
  ];
  const loopPlacementData = [
    { name: 'Loops Placed', value: loopsPlaced },
    { name: 'Loops Not Placed', value: loops.length - loopsPlaced },
  ];

  // Quality by style (beats)
  const beatStyles = [...new Set(beats.map((b) => b.style).filter(Boolean))];
  const qualityByStyleBeats = beatStyles.map((style) => {
    const styleBeats = beats.filter((b) => b.style === style && b.quality_score);
    const avgQuality = styleBeats.length > 0
      ? styleBeats.reduce((sum, b) => sum + (b.quality_score || 0), 0) / styleBeats.length
      : 0;
    return { style, avgQuality: parseFloat(avgQuality.toFixed(1)) };
  });

  // Quality by style (loops)
  const loopStyles = [...new Set(loops.map((l) => l.style).filter(Boolean))];
  const qualityByStyleLoops = loopStyles.map((style) => {
    const styleLoops = loops.filter((l) => l.style === style && l.quality_score);
    const avgQuality = styleLoops.length > 0
      ? styleLoops.reduce((sum, l) => sum + (l.quality_score || 0), 0) / styleLoops.length
      : 0;
    return { style, avgQuality: parseFloat(avgQuality.toFixed(1)) };
  });

  // Scatter: Quality vs BPM
  const beatScatterData = beats
    .filter((b) => b.bpm && b.quality_score)
    .map((b) => ({ bpm: b.bpm, quality: b.quality_score, name: b.title }));

  const loopScatterData = loops
    .filter((l) => l.bpm && l.quality_score)
    .map((l) => ({ bpm: l.bpm, quality: l.quality_score, name: l.title }));

  // Finished vs Ready comparison
  const statusComparisonData = [
    { name: 'Beats Finished', value: beats.filter((b) => b.status === 'Finished').length },
    { name: 'Beats Ready', value: beats.filter((b) => b.status === 'Ready to Send').length },
    { name: 'Loops Finished', value: loops.filter((l) => l.status === 'Finished').length },
    { name: 'Loops Ready', value: loops.filter((l) => l.status === 'Ready to Send').length },
  ];

  // Weekly planning completion
  const completedTasks = planning.filter((t) => t.is_completed).length;
  const totalTasks = planning.length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-8 animate-thunder-strike">
      <div>
        <h1 className="text-3xl font-bold lightning-glow">📊 Analytics Hub</h1>
        <p className="text-muted-foreground">Deep statistics and performance tracking</p>
      </div>

      {/* Daily / Weekly Production Trend */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Daily Cooking – Beats & Loops</h3>
          <Select
            value={timeRange}
            onValueChange={(value: 'week' | 'month') => setTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              allowDecimals={false}
              stroke="hsl(var(--muted-foreground))"
              tickMargin={8}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="beats"
              name="Beats"
              stroke="hsl(271, 76%, 53%)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="loops"
              name="Loops"
              stroke="hsl(189, 100%, 50%)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Beats by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={beatStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {beatStatusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Loops by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={loopStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {loopStatusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality Threshold & Royalties */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Quality Score &gt; 7.5</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityThresholdData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Legend />
              <Bar dataKey="high" name="High Quality" fill="hsl(120, 100%, 50%)" />
              <Bar dataKey="low" name="Below Threshold" fill="hsl(var(--muted))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Royalties Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={royaltiesData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="hsl(120, 100%, 50%)" />
                <Cell fill="hsl(0, 84%, 60%)" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Placement Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Beats Placement Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={placementData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="hsl(271, 76%, 53%)" />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Loops Placement Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={loopPlacementData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="hsl(189, 100%, 50%)" />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality by Style */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Avg Quality by Style (Beats)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityByStyleBeats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="style" stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="avgQuality" fill="hsl(271, 76%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Avg Quality by Style (Loops)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityByStyleLoops}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="style" stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="avgQuality" fill="hsl(189, 100%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter Plots */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Quality vs BPM (Beats)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="bpm" name="BPM" stroke="hsl(var(--muted-foreground))" domain={[60, 200]} />
              <YAxis dataKey="quality" name="Quality" stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Beats" data={beatScatterData} fill="hsl(271, 76%, 53%)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Quality vs BPM (Loops)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="bpm" name="BPM" stroke="hsl(var(--muted-foreground))" domain={[60, 200]} />
              <YAxis dataKey="quality" name="Quality" stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Loops" data={loopScatterData} fill="hsl(189, 100%, 50%)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Comparison */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-4 text-lg font-bold">Finished vs Ready to Send</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(271, 76%, 53%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Completion */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-4 text-lg font-bold">Weekly Planning Completion</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold lightning-glow">{completionRate}%</p>
            <p className="text-muted-foreground mt-2">Tasks Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{completedTasks}</p>
            <p className="text-muted-foreground">of {totalTasks} tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
