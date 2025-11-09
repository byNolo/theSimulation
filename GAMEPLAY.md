# The Simulation - Gameplay Design

## Overview
The Simulation is a collaborative survival game where a community makes daily decisions that affect three core stats: **Morale**, **Supplies**, and **Threat**.

## Core Stats

### Morale (0-100)
- Represents the community's psychological well-being and hope
- **Critical (<30)**: Community on verge of collapse, may trigger crisis events
- **Stable (30-70)**: Normal operations
- **High (>70)**: Opportunity for growth and expansion
- **Game Over at 0**: Community disbands from despair

### Supplies (0-100)
- Food, water, medicine, and basic necessities
- **Critical (<30)**: Food shortage events likely
- **Stable (30-70)**: Sustainable living
- **Abundant (>70)**: Can invest in improvements
- **Game Over at 0**: Community perishes from starvation

### Threat (0-100)
- External dangers (hostile groups, environment, etc.)
- **Low (<30)**: Relative safety, can explore
- **Moderate (30-70)**: Constant vigilance needed
- **High (>70)**: Crisis mode, survival priority
- **Game Over at 100**: Overwhelmed by external forces

## Event System

### Event Categories

#### 1. Crisis Events (Priority: Highest)
**Trigger Conditions**: Any stat critical (<30 for morale/supplies, >70 for threat)
- Food Shortage Critical
- Morale Collapse
- Threat Overwhelming

**Purpose**: Force difficult choices during emergencies
**Balance**: High stakes, potential for dramatic swings

#### 2. Opportunity Events (Priority: High when stable)
**Trigger Conditions**: All stats relatively healthy (>40 morale, >40 supplies, <50 threat)
- Abundant Discovery
- Survivor Joins
- Technology Breakthrough

**Purpose**: Reward good management with growth options
**Balance**: Beneficial overall but require strategic allocation

#### 3. Narrative Events (Priority: Medium)
**Trigger Conditions**: Day milestones, add story flavor
- Mysterious Signal (Day 7+)
- Old World Relic (Day 10+)

**Purpose**: Build world lore and long-term engagement
**Balance**: Moderate impact, enrich experience

#### 4. Daily/General Events (Priority: Baseline)
**Trigger Conditions**: Always available, common occurrence
- Resource Allocation
- Community Dispute
- Weather Challenge
- Skill Development

**Purpose**: Regular gameplay loop, steady progression
**Balance**: Small incremental changes

## Decision Making

### Option Structure
Each event presents 3 choices with:
- **Label**: User-friendly name
- **Description**: Tooltip explaining consequences
- **Deltas**: Stat changes (morale/supplies/threat)

### Voting System
- **Authentication Required**: Players must sign in to vote
- **One Vote Per Day**: Per authenticated user
- **Live Tally**: Updates every 5 seconds
- **Winning Option**: Most votes (alphabetical tiebreaker)

### Admin Control
- Admins can manually "tick" the day forward
- Applies winning option's deltas
- Generates next day's event
- Tracks full history and telemetry

## Gameplay Progression

### Early Game (Days 1-5)
- **Starting Stats**: Morale 70, Supplies 80, Threat 30
- **Focus**: Learning mechanics, establishing baseline
- **Events**: Mostly daily routine events
- **Goal**: Maintain stability

### Mid Game (Days 6-15)
- **Focus**: Strategic resource management
- **Events**: Mix of opportunities and challenges
- **Narrative**: Story elements unlock
- **Goal**: Build toward thriving community

### Late Game (Day 16+)
- **Focus**: Long-term sustainability
- **Events**: Higher stakes, complex decisions
- **Narrative**: Major story beats
- **Goal**: Achieve victory condition or survive

## Win/Lose Conditions

### Loss Conditions (Game Over)
1. **Morale reaches 0**: "The community has lost all hope and disbanded"
2. **Supplies reach 0**: "The community has run out of supplies and perished"
3. **Threat reaches 100**: "The threat has overwhelmed the community"

### Victory Condition (Future)
- Survive X days with all stats above threshold
- Complete narrative arc
- Achieve specific milestone

## Event Selection Algorithm

```
1. Filter events by current world state conditions
2. If any stat critical → Prioritize crisis events
3. If all stats healthy → Weight opportunity events 3x
4. Narrative events → Weight 2x
5. Daily events → Baseline weight 1x
6. Random weighted selection from available pool
```

## Balancing Philosophy

### Risk vs Reward
- High reward options often increase threat or cost supplies
- Safe options provide stability but slower progress
- Community must decide: play it safe or take calculated risks

### Interconnected Systems
- No "always right" answer
- Short-term gains vs long-term sustainability
- Morale vs Supplies vs Security tradeoffs

### Emergent Gameplay
- Previous choices shape available events
- Community develops unique story through decisions
- Replayability through different decision paths

## Future Enhancements

### Planned Features
1. **Season System**: Multi-week campaigns with narrative arcs
2. **Achievement System**: Track milestones and special outcomes
3. **Faction System**: Internal community groups with competing interests
4. **Resource Types**: Break down supplies into food/medicine/materials
5. **Character System**: Named community members with personal stories
6. **Event Chains**: Multi-day storylines with connected decisions
7. **Random Modifiers**: Weather, seasons, luck factors
8. **Victory Paths**: Multiple win conditions (escape, fortify, rebuild society)

### Expansion Ideas
- **Multiplayer Seasons**: Communities compete or cooperate
- **Custom Events**: Admin-created scenarios
- **AI Generator**: GPT-powered dynamic event creation
- **Visualization**: Charts showing stat trends over time
- **Leaderboards**: Longest survival, best outcomes

## Technical Implementation

### Event Definition
Events are defined in `server/events.py` with:
- Conditional availability (stat ranges, day requirements)
- Category for prioritization
- Weight for random selection
- Options with detailed deltas

### State Management
- World state persists day-to-day
- Deltas applied when day "ticks"
- Bounds checking (0-100) on all stats
- Database tracks full history

### Frontend Display
- Real-time vote tallies
- Visual stat bars with status indicators
- Option descriptions for informed voting
- Admin dashboard for oversight

## Contributing Events

Want to add events? Follow this structure:

```python
EventTemplate(
    id="unique_event_id",
    headline="Engaging Title",
    description="Detailed scenario description",
    category="general|crisis|opportunity|narrative",
    weight=1,  # Selection probability
    min_morale=0, max_morale=100,  # Conditions
    min_supplies=0, max_supplies=100,
    min_threat=0, max_threat=100,
    requires_day=0,  # Minimum day number
    options=[
        Option("option_key", "Display Label",
               {"morale": +/-X, "supplies": +/-Y, "threat": +/-Z},
               "Helpful description"),
        # ... 2-3 more options
    ],
)
```

---

**Last Updated**: November 2025
**Version**: 1.0
