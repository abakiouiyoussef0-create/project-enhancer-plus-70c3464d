import { Zap, Music, RefreshCw, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useBeats } from '@/hooks/useBeats';
import { useLoops } from '@/hooks/useLoops';
import { usePlanning } from '@/hooks/usePlanning';
import { KPICard } from '@/components/KPICard';
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
} from 'recharts';

const CHART_COLORS = [
  'hsl(271, 76%, 53%)',   // Primary purple
  'hsl(189, 100%, 50%)',  // Secondary blue
  'hsl(120, 100%, 50%)',  // Green
  'hsl(60, 100%, 50%)',   // Yellow
  'hsl(240, 100%, 50%)',  // Blue
  'hsl(330, 80%, 60%)',   // Pink
];

export default function Dashboard() {
  const { data: beats = [], isLoading: beatsLoading } = useBeats();
  const { data: loops = [], isLoading: loopsLoading } = useLoops();
  const { data: planning = [], isLoading: planningLoading } = usePlanning();

  const isLoading = beatsLoading || loopsLoading || planningLoading;

  // KPI Calculations
  const totalBeats = beats.length;
  const totalLoops = loops.length;
  const totalArsenal = totalBeats + totalLoops;

  const beatsFinished = beats.filter((b) => b.status === 'Finished').length;
  const loopsFinished = loops.filter((l) => l.status === 'Finished').length;

  const beatsReady = beats.filter((b) => b.status === 'Ready to Send').length;
  const loopsReady = loops.filter((l) => l.status === 'Ready to Send').length;
  const combatReady = beatsReady + loopsReady;

  const avgBeatQuality = beats.length > 0
    ? beats.reduce((sum, b) => sum + (b.quality_score || 0), 0) / beats.filter(b => b.quality_score).length || 0
    : 0;
  const avgLoopQuality = loops.length > 0
    ? loops.reduce((sum, l) => sum + (l.quality_score || 0), 0) / loops.filter(l => l.quality_score).length || 0
    : 0;
  const avgQuality = (avgBeatQuality + avgLoopQuality) / 2;

  const industryReadiness = avgQuality * 10;

  const beatsHighScore = beats.filter((b) => (b.quality_score || 0) > 7.5).length;
  const loopsHighScore = loops.filter((l) => (l.quality_score || 0) > 7.5).length;

  const beatsPlaced = beats.filter((b) => b.is_placed).length;
  const loopsPlaced = loops.filter((l) => l.is_placed).length;
  const beatsPlacedPercent = totalBeats > 0 ? ((beatsPlaced / totalBeats) * 100).toFixed(1) : 0;
  const loopsPlacedPercent = totalLoops > 0 ? ((loopsPlaced / totalLoops) * 100).toFixed(1) : 0;

  const freeLoops = loops.filter((l) => l.royalty_status === 'Free' || l.source === 'Original').length;
  const copyrightLoops = loops.filter((l) => l.royalty_status === 'Copyrights' && l.source !== 'Original').length;

  // Chart Data
  const productionComparisonData = [
    { name: 'Beats', count: totalBeats, fill: CHART_COLORS[0] },
    { name: 'Loops', count: totalLoops, fill: CHART_COLORS[1] },
  ];

  const beatStatusData = [
    { name: 'In Progress', value: beats.filter((b) => b.status === 'In Progress').length },
    { name: 'Finished', value: beatsFinished },
    { name: 'Ready to Send', value: beatsReady },
  ];

  const loopStatusData = [
    { name: 'In Progress', value: loops.filter((l) => l.status === 'In Progress').length },
    { name: 'Finished', value: loopsFinished },
    { name: 'Ready to Send', value: loopsReady },
  ];

  const royaltiesData = [
    { name: 'Free', value: freeLoops },
    { name: 'Copyrights', value: copyrightLoops },
  ];

  const placementData = [
    { name: 'Beats Placed', value: beatsPlaced },
    { name: 'Beats Not Placed', value: totalBeats - beatsPlaced },
    { name: 'Loops Placed', value: loopsPlaced },
    { name: 'Loops Not Placed', value: totalLoops - loopsPlaced },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-thunder-strike">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold lightning-glow">⚡ Command Center</h1>
        <p className="text-muted-foreground">PERUNZ THUNDER Production Suite Dashboard</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <KPICard title="Total Arsenal" value={totalArsenal} icon={Zap} />
        <KPICard title="Total Beats" value={totalBeats} icon={Music} />
        <KPICard title="Total Loops" value={totalLoops} icon={RefreshCw} />
        <KPICard title="Combat Ready" value={combatReady} subtitle="Ready to Send" icon={Target} />
        <KPICard
          title="Industry Readiness"
          value={`${industryReadiness.toFixed(0)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Beats Quality > 7.5"
          value={`${beatsHighScore} (${totalBeats > 0 ? ((beatsHighScore / totalBeats) * 100).toFixed(0) : 0}%)`}
          icon={Target}
        />
        <KPICard
          title="Loops Quality > 7.5"
          value={`${loopsHighScore} (${totalLoops > 0 ? ((loopsHighScore / totalLoops) * 100).toFixed(0) : 0}%)`}
          icon={Target}
        />
        <KPICard title="Beats Placed" value={`${beatsPlacedPercent}%`} icon={CheckCircle} />
        <KPICard title="Loops Placed" value={`${loopsPlacedPercent}%`} icon={CheckCircle} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart: Beats vs Loops */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Production Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Beat Status */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Beat Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={beatStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {beatStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Loop Status */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Loop Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={loopStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {loopStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Royalties Distribution */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-lg font-bold">Royalties Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={royaltiesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
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
    </div>
  );
}
