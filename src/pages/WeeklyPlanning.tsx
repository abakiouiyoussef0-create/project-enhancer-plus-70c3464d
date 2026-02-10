import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target, CalendarDays, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DayPlan {
  day: string;
  title: string;
  icon: any;
  color: string;
  primaryFocus: string;
  objectives: string[];
  secondaryTasks: string[];
  successMetric: string;
}

const WEEKLY_SPRINT: DayPlan[] = [];

export default function WeeklyPlanning() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('perun_sprint_progress');
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, []);

  const toggleTask = (taskId: string) => {
    const newCompleted = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(newCompleted);
    localStorage.setItem('perun_sprint_progress', JSON.stringify(newCompleted));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2 relative overflow-hidden rounded-xl p-8 border border-primary/20 bg-gradient-to-r from-background to-primary/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <motion.h1
          className="text-5xl font-black tracking-tighter bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent relative z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          THE WEEKLY RITUAL
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground relative z-10 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Execute with precision. Build your legacy one week at a time.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {WEEKLY_SPRINT.map((dayPlan, index) => (
          <motion.div
            key={dayPlan.day}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/5 hover:shadow-primary/20 transition-all duration-300 group overflow-hidden">
              <div className={`h-1.5 w-full bg-gradient-to-r ${dayPlan.color.replace('text-', 'from-').replace('-400', '-500')} to-transparent relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/50 w-full transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              </div>

              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`${dayPlan.color} border-current bg-background/50 text-sm py-1 px-3 tracking-widest`}>
                    {dayPlan.day}
                  </Badge>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className={`p-2 rounded-full bg-secondary/10 ${dayPlan.color}`}
                  >
                    <dayPlan.icon className="w-6 h-6" />
                  </motion.div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{dayPlan.title}</CardTitle>
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-transparent border border-primary/10">
                  <p className="text-lg font-medium text-foreground/90 flex items-start gap-2">
                    <Target className="w-5 h-5 text-primary mt-1 shrink-0 animate-pulse" />
                    {dayPlan.primaryFocus}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Objectives */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                    Start Execution
                    <div className="h-px flex-1 bg-border" />
                  </h4>
                  <div className="space-y-3">
                    {dayPlan.objectives.map((obj, i) => {
                      const id = `${dayPlan.day}-obj-${i}`;
                      const isChecked = completedTasks[id];
                      return (
                        <motion.div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer group/item
                            ${isChecked ? 'bg-primary/10 border-primary/30' : 'bg-background/20 border-transparent hover:bg-background/40 hover:border-primary/20'}
                          `}
                          onClick={() => toggleTask(id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className={`mt-0.5 rounded-full p-0.5 transition-colors ${isChecked ? 'text-primary' : 'text-muted-foreground group-hover/item:text-primary'}`}>
                            {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </div>
                          <span className={`text-sm font-medium transition-all ${isChecked ? 'text-muted-foreground line-through decoration-primary/50' : 'text-foreground'}`}>
                            {obj}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Tasks */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                    Bonus Objectives
                    <div className="h-px flex-1 bg-border" />
                  </h4>
                  <div className="space-y-2 pl-2">
                    {dayPlan.secondaryTasks.map((task, i) => {
                      const id = `${dayPlan.day}-sec-${i}`;
                      const isChecked = completedTasks[id];
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 group/sec cursor-pointer py-1"
                          onClick={() => toggleTask(id)}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                            ${isChecked ? 'bg-primary w-2 h-2 shadow-[0_0_10px_currentColor] scale-125' : 'bg-muted-foreground group-hover/sec:bg-primary/70'}
                          `} />
                          <span className={`text-sm transition-colors ${isChecked ? 'text-primary' : 'text-muted-foreground group-hover/sec:text-foreground'}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Metric */}
                <div className="pt-4 mt-auto border-t border-primary/10 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium italic text-muted-foreground">
                    "{dayPlan.successMetric}"
                  </p>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
