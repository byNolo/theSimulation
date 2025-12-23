# The Simulation - Survival Guide (v2.0)

## IMPORTANT: THE GAME IS NOW MUCH HARDER!

Your community now faces **daily passive decay**, **random disasters**, and **cascade failures**. Every choice matters significantly more. **Projects are essential to survival.**

---

## DAILY DECAY (Happens Automatically)

Without action, your stats will decline every day:

- **Supplies**: -4/day (plus more if large population)
- **Morale**: -2/day (plus more if conditions are bad)
- **Threat**: +2/day (world gets more dangerous)

**You MUST build projects to counter this decay or you will die!**

---

## RANDOM DISASTERS (15% Chance Daily)

Every day has a 15% chance of a disaster occurring:
- Storms, accidents, illness, theft, wildlife attacks
- Can lose 8-15 stats instantly
- Worse when your stats are already low

**You cannot prevent disasters, only prepare for them.**

---

## CASCADE FAILURES (Automatic Penalties)

When stats reach critical levels, additional penalties trigger:

**If Morale < 25:**
- Supply production drops (people stop working)

**If Supplies < 25:**
- Morale drops (starvation)
- Threat increases (weakness attracts danger)

**If Threat > 75:**
- Morale drops (constant fear)

**Multiple critical stats = penalties double!**

---

## PROJECTS ARE ESSENTIAL

**You MUST build projects to survive!** Each project provides daily buffs:

### FOOD (Counter Supply Decay):
- **Sustainable Farm** (150 cost): +3 supplies/day
- **Greenhouse** (220 cost): +5 supplies/day
- **Storage Depot** (120 cost): +2 supplies/day

### MORALE (Counter Morale Decay):
- **Medical Clinic** (180 cost): +2 morale/day
- **Community Center** (130 cost): +3 morale/day
- **School** (200 cost): +4 morale/day

### SECURITY (Counter Threat Growth):
- **Defensive Walls** (200 cost): -3 threat/day
- **Guard Tower** (170 cost): -4 threat/day
- **Armory** (240 cost): -6 threat/day

### INFRASTRUCTURE (Boost Production):
- **Workshop** (140 cost): +8 production/day
- **Power Generator** (300 cost): +15 production/day
- **Water Purification** (160 cost): -15% all decay
- **Training Ground** (190 cost): -20% all decay

---

## PRODUCTION SYSTEM

Each day, your community produces points toward the active project:

**Production = (Morale × 0.15) + (Supplies × 0.15) + Project Bonuses**

**Production is reduced if:**
- Population < 15: Reduced by 30%
- Morale or Supplies < 20: Reduced by 70%

**To complete projects faster:**
1. Keep morale and supplies high
2. Build Workshop early (+8 production/day)
3. Build Generator later (+15 production/day)

---

## SURVIVAL STRATEGY

### EARLY GAME (Days 1-10):
1. **PRIORITY**: Vote for Sustainable Farm IMMEDIATELY
2. Keep all stats above 40 (critical thresholds)
3. Choose defensive options when threat appears
4. Avoid risky choices that increase threat

### MID GAME (Days 11-20):
1. **BUILD**: Medical Clinic or Community Center for morale
2. **BUILD**: Guard Tower or Defensive Walls for threat
3. Balance all three stats carefully
4. Start thinking about Workshop for faster building

### LATE GAME (Days 21+):
1. **SURVIVE**: Extreme crisis events will appear
2. You need 4-5+ completed projects to counter decay
3. Avoid letting ANY stat go critical
4. Pray you don't get hit by disasters

---

## NEW EXTREME CRISIS EVENTS

Watch out for these devastating events (Days 8+):

- **Deadly Plague**: Can lose -40 morale in one choice!
- **Hostile Raid**: Can lose -40 supplies!
- **Critical Famine**: Worst option -50 morale!
- **Mass Psychological Collapse**: When morale < 20
- **Winter Catastrophe**: When supplies low in late game

**These events can END your game if you're unprepared!**

---

## POPULATION SYSTEM

Population now matters:

**Effects:**
- More people = more supply consumption
- Growth happens in good times (morale>70, supplies>70)
- People leave/die in bad times (morale<25 or supplies<25)
- Low population (<15) reduces production

**Housing Expansion project increases max population capacity.**

---

## VOTING TIPS

### When Supplies Low (<40):
- Choose "+supplies" options aggressively
- Vote for Sustainable Farm project
- Avoid options that cost supplies

### When Morale Low (<40):
- Choose "+morale" options
- Celebrations and festivals worth the cost
- Vote for Medical Clinic project

### When Threat High (>60):
- Choose "-threat" options
- Defensive projects are critical
- Lockdowns and relocations may be necessary

### When All Stats Good:
- Build production infrastructure (Workshop, Generator)
- Take calculated risks for big gains
- Prepare for inevitable disasters

---

## LOSE CONDITIONS

**Game Over if any stat reaches extremes:**
- **Morale = 0**: Community disbands from despair
- **Supplies = 0**: Everyone starves to death
- **Threat = 100**: Overwhelmed by external forces

**With the new decay system, you can slowly lose even without bad choices!**

---

## WIN CONDITION

**Survive as long as possible!**

Success means:
- Keeping all stats above critical levels
- Building multiple projects for stability
- Adapting to disasters and crises
- Managing population growth
- Making it past day 20 is impressive!

---

## PRO TIPS

1. **Never let two stats go critical at once** - cascade failures will destroy you
2. **Build Sustainable Farm first** - food is life
3. **One project per category** (food, morale, security) before specializing
4. **Workshop makes future projects faster** - good mid-game choice
5. **Water Purification or Training Ground** reduce ALL decay - powerful!
6. **Check last_event message** - shows what happened (disasters, projects, etc.)
7. **Population shows in stats** - watch it grow or shrink based on conditions
8. **15% disaster chance** - expect one every ~7 days on average
9. **Crisis events trigger at thresholds** - avoid letting stats get too low
10. **There is no "safe" anymore** - stay vigilant always!

---

## IF YOU'RE LOSING

**All stats in red? Here's emergency triage:**

1. **Identify critical stat** (lowest or most dangerous)
2. **Vote for emergency measures** that fix it (accept high costs)
3. **Start building counter-project** immediately
4. **Avoid risky options** until stabilized
5. **Hope disaster doesn't hit** while recovering

**If multiple stats critical:**
- You're probably doomed
- Take most desperate option available
- Try to save at least one stat above 25
- Learn from mistakes for next playthrough

---

## STAT RANGES

**Excellent** (70-100): Rare, enjoy it while it lasts
**Good** (50-69): Sustainable with projects
**Moderate** (40-49): Acceptable, watch closely
**Warning** (30-39): Dangerous, take corrective action
**Critical** (20-29): Emergency! Penalties triggering
**Catastrophic** (<20): Near death, desperate measures only

---

## REALISTIC EXPECTATIONS

**This is now a challenging survival game. Expect to:**
- Struggle to keep stats above 50
- Make hard choices with no good options
- Lose to bad luck sometimes (disasters)
- Need 10+ days to build first few projects
- See stats swing ±10-20 per day
- Feel tension on every vote

**If you make it to day 30 with all stats >40, you've mastered the game!**

---

## RESTART TIPS

If you want to start fresh:

```bash
# Admin can reset the simulation
# Clears all progress but keeps user accounts
# Lets you try different strategies
```

**Learn from each attempt:**
- What projects did you prioritize?
- Did you let a stat get too low?
- Which events caused the most trouble?
- Did you adapt to disasters well?

---

## GOOD LUCK, SURVIVOR!

The odds are against you. The world is harsh. Disasters will strike. But with strategy, teamwork, and a bit of luck, your community can endure.

**Remember:**
- Vote every day
- Build projects constantly
- Balance all three stats
- Prepare for the worst
- Hope for the best

**May your community survive!**

---

*Updated: December 2025 - Game Balance v2.0*
