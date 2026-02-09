import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target, CalendarDays, Music, Share2, Disc, Video, Archive } from "lucide-react";

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

const WEEKLY_SPRINT: DayPlan[] = [
  {
    day: "MONDAY",
    title: "Loop Extraction & Sound Design",
    icon: Music,
    color: "text-blue-400",
    primaryFocus: "Create 10–15 original loops (melodic and/or rhythmic). No full beats. No arrangement.",
    objectives: [
      "Design unique textures, chords, bass phrases, and drum patterns",
      "Work in MIDI first, then commit to audio",
      "Push originality over perfection"
    ],
    secondaryTasks: [
      "Build custom drum racks and instrument presets",
      "Process loops heavily (EQ, saturation, modulation, resampling)",
      "Label and export loops cleanly (key + BPM)",
      "Discard anything mid—only keep loops you’d send to another producer"
    ],
    successMetric: "A folder of loops that instantly spark ideas when dropped into a session."
  },
  {
    day: "TUESDAY",
    title: "The Foundation (Drum Processing & Pocket)",
    icon: Disc,
    color: "text-purple-400",
    primaryFocus: "Create 5–10 strong rhythmic foundations using Monday’s loops.",
    objectives: [
      "Pair loops with drums that feel expensive",
      "Lock in groove, swing, and bounce",
      "Prioritize kick, snare, and bass relationship"
    ],
    secondaryTasks: [
      "Level drums early—no sloppy gain staging",
      "Test multiple drum kits per loop",
      "Print drum bounces for speed later",
      "Kill weak ideas fast and move on"
    ],
    successMetric: "Foundations that make you nod without melody distractions."
  },
  {
    day: "WEDNESDAY",
    title: "Full Arrangement & Beat Finishing",
    icon: CalendarDays,
    color: "text-indigo-400",
    primaryFocus: "Turn the best 3–5 ideas into fully arranged beats.",
    objectives: [
      "Build full song structures (Intro, Verse, Hook, Bridge/Drop, Outro)",
      "Add transitions, drops, ear candy, and energy shifts",
      "Commit to decisions—no endless tweaking"
    ],
    secondaryTasks: [
      "Mute test: does the beat still hit when elements drop out?",
      "Simplify arrangements for vocal space",
      "Bounce clean rough mixes",
      "Title beats and tag vibe/tempo/genre"
    ],
    successMetric: "Finished beats that feel ready for artists—not demos."
  },
  {
    day: "THURSDAY",
    title: "Collaboration & Outreach",
    icon: Share2,
    color: "text-green-400",
    primaryFocus: "Expand reach and pipeline through intentional networking.",
    objectives: [
      "Send loops or beats to 5–10 producers",
      "Reach out to vocalists/artists that fit your sound",
      "Review any incoming stems or collabs"
    ],
    secondaryTasks: [
      "Follow up on past conversations (no spamming)",
      "Organize collab folders and notes",
      "Identify 1–2 high-potential partnerships to pursue deeper"
    ],
    successMetric: "At least one real connection or ongoing collaboration per week."
  },
  {
    day: "FRIDAY",
    title: "Mixdown & Master Polish",
    icon: Target,
    color: "text-orange-400",
    primaryFocus: "Make Wednesday’s beats industry-ready.",
    objectives: [
      "Final EQ, compression, saturation, and balance",
      "Tight low end and clean mids",
      "Competitive loudness without killing dynamics"
    ],
    secondaryTasks: [
      "Reference against commercial tracks",
      "Print multiple versions (tagged, untagged, instrumental)",
      "Fix problem frequencies and phase issues",
      "Create stems if needed"
    ],
    successMetric: "Beats that translate across headphones, cars, clubs, and phones."
  },
  {
    day: "SATURDAY",
    title: "Content Creation & Branding",
    icon: Video,
    color: "text-pink-400",
    primaryFocus: "Turn production into visibility.",
    objectives: [
      "Screen record sessions for Reels/TikTok/Shorts",
      "Highlight drops, transitions, or sound design moments",
      "Post consistently—not perfectly"
    ],
    secondaryTasks: [
      "Write captions, tags, and titles",
      "Prep cover art or visual templates",
      "Batch content for future weeks",
      "Study what content performed well"
    ],
    successMetric: "At least 3–5 pieces of content ready or posted."
  },
  {
    day: "SUNDAY",
    title: "Admin, Cataloging & Forward Planning",
    icon: Archive,
    color: "text-gray-400",
    primaryFocus: "Protect your work and set up next week.",
    objectives: [
      "Organize sessions, stems, and exports",
      "Back up everything (local + cloud)",
      "Upload beats to your store or private catalog"
    ],
    secondaryTasks: [
      "Review what worked creatively this week",
      "Identify bottlenecks or weak points",
      "Set 1–3 clear goals for next sprint"
    ],
    successMetric: "Zero chaos. Clear direction for Monday."
  }
];

export default function WeeklyPlanning() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Weekly Production Sprint
        </h1>
        <p className="text-xl text-muted-foreground">
          Generate high-quality, release-ready beats while building catalog, relationships, and brand.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {WEEKLY_SPRINT.map((dayPlan) => (
          <Card key={dayPlan.day} className="border-primary/20 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow overflow-hidden group">
            <div className={`h-1 w-full bg-gradient-to-r ${dayPlan.color.replace('text-', 'from-').replace('-400', '-500')} to-transparent opacity-60`} />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={`${dayPlan.color} border-current bg-background/50`}>
                  {dayPlan.day}
                </Badge>
                <dayPlan.icon className={`w-5 h-5 ${dayPlan.color}`} />
              </div>
              <CardTitle className="text-xl">{dayPlan.title}</CardTitle>
              <CardDescription className="text-base font-medium text-foreground/90 mt-2 p-3 bg-secondary/50 rounded-md border border-primary/10">
                🎯 {dayPlan.primaryFocus}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" /> Key Objectives
                </h4>
                <ul className="space-y-2">
                  {dayPlan.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Circle className="w-4 h-4" /> Secondary Tasks
                </h4>
                <ul className="space-y-2">
                  {dayPlan.secondaryTasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-primary/10">
                <p className="text-sm font-medium flex items-center gap-2 text-primary">
                  <span>🏆</span>
                  <span className="italic">{dayPlan.successMetric}</span>
                </p>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
