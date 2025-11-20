from dataclasses import dataclass
from typing import List, Dict, Optional
import random


def get_custom_events_from_db():
    """Load custom events from database at runtime"""
    try:
        from .models import CustomEvent
        from .db import db
        from flask import has_app_context
        
        if not has_app_context():
            return []
        
        custom_events = CustomEvent.query.filter_by(is_active=True).all()
        templates = []
        
        for ce in custom_events:
            # Convert database custom event to EventTemplate
            options = [
                Option(
                    key=opt['key'],
                    label=opt['label'],
                    deltas=opt['deltas'],
                    description=opt.get('description')
                )
                for opt in ce.options
            ]
            
            template = EventTemplate(
                id=ce.event_id,
                headline=ce.headline,
                description=ce.description,
                category=ce.category,
                weight=ce.weight,
                min_morale=ce.min_morale,
                max_morale=ce.max_morale,
                min_supplies=ce.min_supplies,
                max_supplies=ce.max_supplies,
                min_threat=ce.min_threat,
                max_threat=ce.max_threat,
                requires_day=ce.requires_day,
                options=options
            )
            templates.append(template)
        
        return templates
    except Exception as e:
        # If database not available or error, return empty list
        print(f"Warning: Could not load custom events: {e}")
        return []


@dataclass
class Option:
    key: str
    label: str  # User-friendly display text
    deltas: Dict[str, int]
    description: Optional[str] = None  # Optional tooltip/explanation

@dataclass
class EventTemplate:
    id: str
    headline: str
    description: str
    options: List[Option]
    category: str = "general"  # general, crisis, opportunity, narrative
    weight: int = 1  # Higher weight = more likely to appear
    min_morale: int = 0  # Conditions for this event to appear
    max_morale: int = 100
    min_supplies: int = 0
    max_supplies: int = 100
    min_threat: int = 0
    max_threat: int = 100
    requires_day: int = 0  # Minimum day number

# ====== CRISIS EVENTS (when things are going poorly) ======
CRISIS_EVENTS: List[EventTemplate] = [
    EventTemplate(
        id="food_shortage_critical",
        headline="Food Stores Critically Low!",
        description="The community's food supplies are nearly depleted. Desperate measures are needed.",
        category="crisis",
        max_supplies=20,
        options=[
            Option("emergency_rationing", "Emergency Rationing", 
                   {"morale": -8, "supplies": +15, "threat": +2},
                   "Strict rationing might save us, but morale will suffer"),
            Option("desperate_hunt", "Desperate Hunt", 
                   {"morale": +3, "supplies": +8, "threat": +8},
                   "Risk sending everyone out to find food"),
            Option("negotiate_outsiders", "Seek Outside Help", 
                   {"morale": -5, "supplies": +20, "threat": +15},
                   "Reveal our location to potential traders"),
        ],
    ),
    EventTemplate(
        id="morale_collapse",
        headline="Community on the Brink of Collapse",
        description="Despair has taken hold. People are talking about giving up or leaving.",
        category="crisis",
        max_morale=25,
        options=[
            Option("inspirational_speech", "Rally the People", 
                   {"morale": +15, "supplies": -3, "threat": 0},
                   "Remind them why we fight to survive"),
            Option("festival", "Hold a Festival", 
                   {"morale": +20, "supplies": -10, "threat": +5},
                   "A celebration might lift spirits despite the cost"),
            Option("accept_reality", "Accept Losses", 
                   {"morale": +5, "supplies": +5, "threat": -3},
                   "Let those who want to leave go, keep those who remain"),
        ],
    ),
    EventTemplate(
        id="threat_overwhelming",
        headline="Threat Level Critical!",
        description="Danger surrounds the community. Something must be done immediately.",
        category="crisis",
        min_threat=70,
        options=[
            Option("full_lockdown", "Full Lockdown", 
                   {"morale": -10, "supplies": -5, "threat": -20},
                   "Seal everything and wait it out"),
            Option("preemptive_strike", "Preemptive Action", 
                   {"morale": -5, "supplies": -8, "threat": -15},
                   "Take the fight to them before they come to us"),
            Option("emergency_evacuation", "Emergency Relocation", 
                   {"morale": -8, "supplies": -12, "threat": -25},
                   "Abandon this location for a safer one"),
        ],
    ),
    EventTemplate(
        id="disease_outbreak",
        headline="Illness Spreading Through Community",
        description="Several people have fallen ill. Without proper medicine, it could spread rapidly.",
        category="crisis",
        max_morale=40,
        options=[
            Option("quarantine_sick", "Strict Quarantine", 
                   {"morale": -12, "supplies": -5, "threat": 0},
                   "Isolate the sick to prevent spread"),
            Option("herbal_remedies", "Try Natural Remedies", 
                   {"morale": +3, "supplies": -8, "threat": +5},
                   "Use whatever plants and herbs we can find"),
            Option("push_through", "Rest and Hope", 
                   {"morale": -5, "supplies": -3, "threat": +3},
                   "Let them recover naturally while continuing work"),
        ],
    ),
    EventTemplate(
        id="infrastructure_collapse",
        headline="Critical Infrastructure Failure",
        description="Essential systems are breaking down. Immediate repairs needed or face severe consequences.",
        category="crisis",
        max_supplies=25,
        max_threat=60,
        options=[
            Option("emergency_repairs", "Emergency Repairs", 
                   {"morale": -5, "supplies": -10, "threat": -8},
                   "Use whatever we have to fix it now"),
            Option("scavenge_parts", "Scavenge for Parts", 
                   {"morale": -3, "supplies": +5, "threat": +12},
                   "Send teams to find what we need"),
            Option("improvise", "Improvise Solutions", 
                   {"morale": +5, "supplies": -15, "threat": +5},
                   "Get creative with what we have"),
        ],
    ),
    EventTemplate(
        id="internal_conflict",
        headline="Internal Power Struggle",
        description="Factions are forming within the community. Leadership is being questioned.",
        category="crisis",
        max_morale=30,
        requires_day=5,
        options=[
            Option("reassert_authority", "Assert Leadership", 
                   {"morale": -8, "supplies": +5, "threat": -5},
                   "Make it clear who's in charge"),
            Option("unity_council", "Form a Council", 
                   {"morale": +10, "supplies": -5, "threat": +8},
                   "Share power with different voices"),
            Option("exile_troublemakers", "Remove Dissenters", 
                   {"morale": -15, "supplies": +8, "threat": -12},
                   "Exile those causing problems"),
        ],
    ),
    EventTemplate(
        id="water_contamination",
        headline="Water Supply Contaminated!",
        description="The main water source has been tainted. We need clean water immediately.",
        category="crisis",
        max_supplies=30,
        options=[
            Option("boil_everything", "Boil All Water", 
                   {"morale": -5, "supplies": -8, "threat": 0},
                   "Use fuel to make it safe"),
            Option("find_new_source", "Search for New Source", 
                   {"morale": -3, "supplies": -5, "threat": +15},
                   "Risky but necessary expedition"),
            Option("rain_collection", "Emergency Rain Collection", 
                   {"morale": +2, "supplies": +5, "threat": +5},
                   "Set up systems to catch rainwater"),
        ],
    ),
]

# ====== OPPORTUNITY EVENTS (when things are stable) ======
OPPORTUNITY_EVENTS: List[EventTemplate] = [
    EventTemplate(
        id="abundant_harvest",
        headline="Bountiful Discovery",
        description="Scouts have found an abandoned supply cache. How should we use it?",
        category="opportunity",
        min_morale=40,
        min_supplies=40,
        options=[
            Option("stockpile", "Stockpile Everything", 
                   {"morale": +5, "supplies": +20, "threat": 0},
                   "Save it for harder times"),
            Option("share_celebration", "Share and Celebrate", 
                   {"morale": +15, "supplies": +10, "threat": +3},
                   "Boost morale with this windfall"),
            Option("trade_supplies", "Trade for Security", 
                   {"morale": +3, "supplies": +8, "threat": -12},
                   "Use some to improve our defenses"),
        ],
    ),
    EventTemplate(
        id="survivor_joins",
        headline="Survivors Request Entry",
        description="A small group of survivors has found the community and asks to join.",
        category="opportunity",
        min_morale=30,
        requires_day=3,
        options=[
            Option("welcome_all", "Welcome Them", 
                   {"morale": +8, "supplies": -8, "threat": +5},
                   "More people means more strength and diversity"),
            Option("cautious_trial", "Trial Period", 
                   {"morale": +3, "supplies": -3, "threat": +2},
                   "Let them prove themselves first"),
            Option("turn_away", "Turn Them Away", 
                   {"morale": -5, "supplies": +2, "threat": -5},
                   "We can't risk unknown variables"),
        ],
    ),
    EventTemplate(
        id="tech_discovery",
        headline="Technological Breakthrough",
        description="Someone has figured out how to repurpose old equipment. What should we prioritize?",
        category="opportunity",
        min_supplies=30,
        requires_day=5,
        options=[
            Option("improve_farming", "Farming Equipment", 
                   {"morale": +5, "supplies": +15, "threat": 0},
                   "Long-term food security"),
            Option("communication", "Communication Devices", 
                   {"morale": +10, "supplies": -5, "threat": +8},
                   "Connect with other communities"),
            Option("defense_tech", "Defense Systems", 
                   {"morale": +3, "supplies": -5, "threat": -15},
                   "Better protection from threats"),
        ],
    ),
    EventTemplate(
        id="skilled_refugee",
        headline="Talented Newcomer",
        description="A refugee with valuable pre-collapse skills wants to join. What role should they take?",
        category="opportunity",
        min_morale=35,
        requires_day=4,
        options=[
            Option("teacher", "Teacher and Mentor", 
                   {"morale": +12, "supplies": -3, "threat": 0},
                   "Share knowledge with the whole community"),
            Option("engineer", "Engineer and Builder", 
                   {"morale": +5, "supplies": +12, "threat": -8},
                   "Improve our infrastructure"),
            Option("scout", "Scout and Explorer", 
                   {"morale": +3, "supplies": +8, "threat": +10},
                   "Help us find resources"),
        ],
    ),
    EventTemplate(
        id="trade_caravan",
        headline="Trading Caravan Arrives",
        description="Merchants have arrived with goods to trade. What should we prioritize?",
        category="opportunity",
        min_morale=40,
        min_supplies=20,
        requires_day=6,
        options=[
            Option("trade_for_food", "Trade for Food", 
                   {"morale": +5, "supplies": +18, "threat": +3},
                   "Stock up on essentials"),
            Option("trade_for_weapons", "Trade for Weapons", 
                   {"morale": +3, "supplies": -5, "threat": -18},
                   "Improve our security"),
            Option("trade_for_luxuries", "Trade for Luxuries", 
                   {"morale": +18, "supplies": -8, "threat": +5},
                   "Boost morale with comforts"),
        ],
    ),
    EventTemplate(
        id="natural_bounty",
        headline="Nature Provides",
        description="The surrounding area is suddenly full of edible plants and game. A rare opportunity!",
        category="opportunity",
        min_morale=30,
        max_threat=50,
        options=[
            Option("massive_harvest", "All-Out Harvest", 
                   {"morale": +8, "supplies": +25, "threat": +8},
                   "Send everyone to gather as much as possible"),
            Option("sustainable_gather", "Sustainable Gathering", 
                   {"morale": +5, "supplies": +15, "threat": +3},
                   "Take what we need, leave the rest"),
            Option("preserve_future", "Preserve for Future", 
                   {"morale": +10, "supplies": +8, "threat": 0},
                   "Establish sustainable practices"),
        ],
    ),
    EventTemplate(
        id="allied_community",
        headline="Alliance Opportunity",
        description="Another surviving community has proposed a mutual aid agreement.",
        category="opportunity",
        min_morale=45,
        requires_day=8,
        options=[
            Option("full_alliance", "Full Alliance", 
                   {"morale": +15, "supplies": -8, "threat": -12},
                   "Share everything, stronger together"),
            Option("trade_only", "Trade Agreement Only", 
                   {"morale": +5, "supplies": +5, "threat": -5},
                   "Maintain independence, trade goods"),
            Option("decline", "Politely Decline", 
                   {"morale": -3, "supplies": +3, "threat": +8},
                   "We're better off alone"),
        ],
    ),
    EventTemplate(
        id="generator_find",
        headline="Working Generator Found!",
        description="Scouts discovered a functioning generator. How should we use this power?",
        category="opportunity",
        min_supplies=35,
        requires_day=7,
        options=[
            Option("lighting", "Community Lighting", 
                   {"morale": +15, "supplies": -5, "threat": -8},
                   "Safety and morale from light at night"),
            Option("workshop", "Power Workshop", 
                   {"morale": +5, "supplies": +15, "threat": 0},
                   "Enable better production"),
            Option("communication", "Power Radio", 
                   {"morale": +10, "supplies": -3, "threat": +12},
                   "Connect with the outside world"),
        ],
    ),
]

# ====== NARRATIVE/STORY EVENTS ======
NARRATIVE_EVENTS: List[EventTemplate] = [
    EventTemplate(
        id="mysterious_signal",
        headline="Strange Signal Detected",
        description="The old radio has picked up a repeating signal. It could be other survivors—or a trap.",
        category="narrative",
        requires_day=7,
        options=[
            Option("investigate_signal", "Investigate", 
                   {"morale": +5, "supplies": -5, "threat": +10},
                   "Risk it to find potential allies"),
            Option("ignore_signal", "Ignore It", 
                   {"morale": -3, "supplies": 0, "threat": -2},
                   "Play it safe"),
            Option("monitor_only", "Monitor and Wait", 
                   {"morale": 0, "supplies": -2, "threat": +3},
                   "Gather more information first"),
        ],
    ),
    EventTemplate(
        id="old_world_relic",
        headline="Discovery of the Old World",
        description="Someone found a sealed time capsule from before the collapse. Should we open it?",
        category="narrative",
        requires_day=10,
        options=[
            Option("open_capsule", "Open It", 
                   {"morale": +10, "supplies": +5, "threat": 0},
                   "Remember what we're trying to preserve"),
            Option("preserve_sealed", "Keep It Sealed", 
                   {"morale": -5, "supplies": +3, "threat": -3},
                   "Some things are better left in the past"),
            Option("ceremony", "Public Ceremony", 
                   {"morale": +15, "supplies": 0, "threat": +2},
                   "Make it a community moment"),
        ],
    ),
    EventTemplate(
        id="prophetic_dream",
        headline="Disturbing Visions",
        description="Multiple people report having the same nightmare. Coincidence or warning?",
        category="narrative",
        requires_day=12,
        options=[
            Option("investigate_dreams", "Take It Seriously", 
                   {"morale": -5, "supplies": -5, "threat": -10},
                   "Prepare for what they foresaw"),
            Option("dismiss", "Dismiss as Stress", 
                   {"morale": +5, "supplies": 0, "threat": +5},
                   "Don't feed into superstition"),
            Option("document", "Document and Monitor", 
                   {"morale": 0, "supplies": -2, "threat": 0},
                   "Keep track but stay rational"),
        ],
    ),
    EventTemplate(
        id="abandoned_bunker",
        headline="Pre-War Bunker Discovered",
        description="An underground facility has been found. It's sealed, but we might be able to enter.",
        category="narrative",
        requires_day=9,
        options=[
            Option("force_entry", "Force It Open", 
                   {"morale": +8, "supplies": +15, "threat": +15},
                   "Unknown risks, unknown rewards"),
            Option("cautious_entry", "Careful Investigation", 
                   {"morale": +5, "supplies": +8, "threat": +5},
                   "Take our time and be safe"),
            Option("leave_sealed", "Leave It Alone", 
                   {"morale": -8, "supplies": 0, "threat": -8},
                   "Some doors should stay closed"),
        ],
    ),
    EventTemplate(
        id="ghost_town",
        headline="Nearby Ghost Town",
        description="Scouts found an abandoned town nearby. No signs of what happened to the people.",
        category="narrative",
        requires_day=11,
        options=[
            Option("scavenge_town", "Scavenge Everything", 
                   {"morale": -8, "supplies": +20, "threat": +12},
                   "Lots of resources, but feels wrong"),
            Option("investigate_mystery", "Investigate What Happened", 
                   {"morale": -5, "supplies": +5, "threat": +8},
                   "Learn from their fate"),
            Option("avoid_town", "Stay Away", 
                   {"morale": +3, "supplies": -3, "threat": -5},
                   "There's a reason it's empty"),
        ],
    ),
    EventTemplate(
        id="visitor_from_past",
        headline="Unexpected Reunion",
        description="Someone from a community member's past has arrived with news from far away.",
        category="narrative",
        requires_day=13,
        options=[
            Option("share_information", "Exchange Information", 
                   {"morale": +12, "supplies": -5, "threat": +8},
                   "Learn about the wider world"),
            Option("offer_shelter", "Offer Them Shelter", 
                   {"morale": +8, "supplies": -8, "threat": +3},
                   "Help an old friend"),
            Option("send_away", "Send Them On", 
                   {"morale": -5, "supplies": +3, "threat": -5},
                   "Don't want to attract attention"),
        ],
    ),
    EventTemplate(
        id="ancient_warning",
        headline="Mysterious Markings Found",
        description="Strange symbols have been found carved into trees around the perimeter. A warning?",
        category="narrative",
        requires_day=8,
        options=[
            Option("decipher", "Try to Decipher", 
                   {"morale": -8, "supplies": -3, "threat": +5},
                   "Understanding might protect us"),
            Option("erase", "Erase Them All", 
                   {"morale": +5, "supplies": 0, "threat": +8},
                   "Don't let fear control us"),
            Option("leave_markings", "Leave Them Be", 
                   {"morale": -3, "supplies": 0, "threat": -3},
                   "Might be important"),
        ],
    ),
]

# ====== DAILY ROUTINE EVENTS (common, balanced) ======
DAILY_EVENTS: List[EventTemplate] = [
    EventTemplate(
        id="resource_allocation",
        headline="Daily Resource Allocation",
        description="How should we prioritize today's work and resources?",
        category="general",
        weight=3,
        options=[
            Option("balanced", "Balanced Approach", 
                   {"morale": +2, "supplies": +3, "threat": -2},
                   "Spread effort evenly"),
            Option("focus_defense", "Focus on Defense", 
                   {"morale": -3, "supplies": -2, "threat": -8},
                   "Security above all"),
            Option("focus_gathering", "Focus on Gathering", 
                   {"morale": +1, "supplies": +8, "threat": +4},
                   "Build up our supplies"),
        ],
    ),
    EventTemplate(
        id="community_dispute",
        headline="Community Disagreement",
        description="A heated debate has broken out about community priorities. How to resolve it?",
        category="general",
        weight=2,
        options=[
            Option("democratic_vote", "Hold a Vote", 
                   {"morale": +5, "supplies": -2, "threat": 0},
                   "Let everyone have their say"),
            Option("leadership_decides", "Leadership Decides", 
                   {"morale": -3, "supplies": +2, "threat": -3},
                   "Quick decisions, less debate"),
            Option("compromise", "Find Compromise", 
                   {"morale": +3, "supplies": 0, "threat": +1},
                   "Make everyone a little happy"),
        ],
    ),
    EventTemplate(
        id="weather_challenge",
        headline="Challenging Weather Ahead",
        description="Bad weather is approaching. How should the community prepare?",
        category="general",
        weight=2,
        options=[
            Option("shelter_prep", "Reinforce Shelter", 
                   {"morale": +2, "supplies": -5, "threat": -5},
                   "Protect what we have"),
            Option("gather_before_storm", "Gather Resources Now", 
                   {"morale": -2, "supplies": +10, "threat": +5},
                   "Stock up while we can"),
            Option("business_as_usual", "Continue Normally", 
                   {"morale": +4, "supplies": -2, "threat": +3},
                   "Don't let weather control us"),
        ],
    ),
    EventTemplate(
        id="skill_development",
        headline="Community Education",
        description="People want to learn new skills. What should we teach?",
        category="general",
        weight=2,
        min_morale=30,
        options=[
            Option("survival_skills", "Survival Training", 
                   {"morale": +3, "supplies": +5, "threat": -5},
                   "Essential knowledge"),
            Option("cultural_arts", "Arts and Culture", 
                   {"morale": +12, "supplies": -3, "threat": +2},
                   "Preserve our humanity"),
            Option("technical_training", "Technical Skills", 
                   {"morale": +5, "supplies": +8, "threat": 0},
                   "Practical knowledge"),
        ],
    ),
    EventTemplate(
        id="guard_duty",
        headline="Guard Rotation Decision",
        description="How should we organize night watch and security patrols?",
        category="general",
        weight=2,
        options=[
            Option("strict_rotation", "Strict Rotation", 
                   {"morale": -5, "supplies": 0, "threat": -10},
                   "Everyone takes turns, maximum security"),
            Option("volunteer_basis", "Volunteer Basis", 
                   {"morale": +5, "supplies": +3, "threat": +5},
                   "Let people choose when to help"),
            Option("professional_guards", "Dedicated Guards", 
                   {"morale": +3, "supplies": -5, "threat": -8},
                   "Train specialists for security"),
        ],
    ),
    EventTemplate(
        id="youth_future",
        headline="Planning for the Next Generation",
        description="What should we prioritize for the children in our community?",
        category="general",
        weight=2,
        min_morale=35,
        options=[
            Option("education", "Formal Education", 
                   {"morale": +10, "supplies": -5, "threat": +3},
                   "Teach reading, math, history"),
            Option("apprenticeship", "Practical Skills", 
                   {"morale": +5, "supplies": +8, "threat": 0},
                   "Learn by doing real work"),
            Option("childhood", "Let Them Be Kids", 
                   {"morale": +15, "supplies": -8, "threat": +5},
                   "Preserve their innocence"),
        ],
    ),
    EventTemplate(
        id="memorial_day",
        headline="Remembering the Lost",
        description="It's been proposed to honor those we've lost. How should we remember?",
        category="general",
        weight=2,
        requires_day=5,
        options=[
            Option("monument", "Build a Monument", 
                   {"morale": +8, "supplies": -8, "threat": 0},
                   "A permanent reminder"),
            Option("ceremony", "Hold a Ceremony", 
                   {"morale": +12, "supplies": -3, "threat": +2},
                   "Come together in remembrance"),
            Option("silence", "Moment of Silence", 
                   {"morale": +5, "supplies": 0, "threat": 0},
                   "Simple and personal"),
        ],
    ),
    EventTemplate(
        id="animal_encounter",
        headline="Wildlife in the Area",
        description="Animals have been spotted near the community. How should we respond?",
        category="general",
        weight=2,
        options=[
            Option("hunt", "Hunt for Food", 
                   {"morale": +3, "supplies": +12, "threat": +5},
                   "Valuable protein source"),
            Option("observe", "Observe and Study", 
                   {"morale": +8, "supplies": +3, "threat": +2},
                   "Learn from nature"),
            Option("drive_away", "Drive Them Away", 
                   {"morale": -3, "supplies": 0, "threat": -5},
                   "Protect our territory"),
        ],
    ),
    EventTemplate(
        id="music_night",
        headline="Community Gathering Proposed",
        description="Someone suggests an evening of music and storytelling. Worth the time?",
        category="general",
        weight=2,
        min_morale=25,
        options=[
            Option("full_celebration", "Big Celebration", 
                   {"morale": +18, "supplies": -10, "threat": +5},
                   "Go all out, everyone needs this"),
            Option("modest_gathering", "Modest Gathering", 
                   {"morale": +10, "supplies": -3, "threat": +2},
                   "Small but meaningful"),
            Option("skip_it", "Focus on Work", 
                   {"morale": -8, "supplies": +5, "threat": -3},
                   "We can't afford distractions"),
        ],
    ),
    EventTemplate(
        id="tool_maintenance",
        headline="Equipment Maintenance Day",
        description="Our tools and equipment need upkeep. How thorough should we be?",
        category="general",
        weight=2,
        options=[
            Option("full_maintenance", "Complete Overhaul", 
                   {"morale": -5, "supplies": +15, "threat": -5},
                   "Time-consuming but thorough"),
            Option("basic_repairs", "Basic Repairs", 
                   {"morale": +2, "supplies": +8, "threat": 0},
                   "Fix what's broken"),
            Option("minimal_upkeep", "Quick Check", 
                   {"morale": +5, "supplies": +3, "threat": +3},
                   "Just enough to keep going"),
        ],
    ),
    EventTemplate(
        id="new_crop",
        headline="Experimental Farming",
        description="Someone wants to try growing a new type of crop. Should we allocate resources?",
        category="general",
        weight=2,
        min_supplies=30,
        options=[
            Option("full_commitment", "Full Trial", 
                   {"morale": +8, "supplies": +15, "threat": +3},
                   "Could pay off big"),
            Option("small_test", "Small Test Plot", 
                   {"morale": +5, "supplies": +5, "threat": 0},
                   "Low risk, modest reward"),
            Option("stick_traditional", "Stick to What Works", 
                   {"morale": -5, "supplies": +8, "threat": -3},
                   "Don't risk our food security"),
        ],
    ),
]

# Combine all events
ALL_EVENTS = CRISIS_EVENTS + OPPORTUNITY_EVENTS + NARRATIVE_EVENTS + DAILY_EVENTS


def get_all_available_events():
    """Get all events including custom ones from database"""
    builtin = ALL_EVENTS.copy()
    custom = get_custom_events_from_db()
    return builtin + custom


def find_template_by_options(options):
       """Find an EventTemplate that matches a stored event's options.

       `options` may be a list of dicts with 'key' or a list of simple keys.
       Returns an EventTemplate or None.
       """
       if not options:
              return None

       # Normalize keys from stored event
       option_keys = set([opt['key'] if isinstance(opt, dict) else opt for opt in options])

       # Search all available templates (builtin + custom)
       all_events = get_all_available_events()
       for template in all_events:
              template_keys = set([opt.key for opt in template.options])
              if template_keys == option_keys:
                     return template

       return None


def is_event_available(event: EventTemplate, morale: int, supplies: int, threat: int, day_number: int) -> bool:
    """Check if an event meets the conditions to appear"""
    if day_number < event.requires_day:
        return False
    if not (event.min_morale <= morale <= event.max_morale):
        return False
    if not (event.min_supplies <= supplies <= event.max_supplies):
        return False
    if not (event.min_threat <= threat <= event.max_threat):
        return False
    return True


def choose_template(morale: int, supplies: int, threat: int, day_number: int = 0) -> EventTemplate:
    """
    Choose an event based on current world state.
    Prioritizes:
    1. Crisis events when conditions are dire
    2. Opportunity events when stable
    3. Narrative events for story progression
    4. Daily events as fallback
    Includes custom events from database.
    """
    # Get all events including custom ones
    all_events = get_all_available_events()
    
    # Filter available events
    available = [
        event for event in all_events
        if is_event_available(event, morale, supplies, threat, day_number)
    ]
    
    if not available:
        # Fallback to first daily event if nothing matches
        return DAILY_EVENTS[0]
    
    # Categorize by priority
    crisis = [e for e in available if e.category == "crisis"]
    opportunity = [e for e in available if e.category == "opportunity"]
    narrative = [e for e in available if e.category == "narrative"]
    daily = [e for e in available if e.category == "general"]
    
    # Crisis events take priority if any stat is critical
    if (morale < 30 or supplies < 30 or threat > 70) and crisis:
        return random.choice(crisis)
    
    # Weighted random selection for other categories
    weights = []
    choices = []
    
    # Opportunity events more likely when stable
    if morale > 50 and supplies > 50 and threat < 50:
        for event in opportunity:
            choices.append(event)
            weights.append(event.weight * 3)
    
    # Narrative events for variety (moderate weight)
    for event in narrative:
        choices.append(event)
        weights.append(event.weight * 2)
    
    # Daily events as baseline
    for event in daily:
        choices.append(event)
        weights.append(event.weight)
    
    if not choices:
        return available[0]
    
    return random.choices(choices, weights=weights, k=1)[0]


def deltas_for_option(option_key: str, event_template: Optional[EventTemplate] = None) -> Dict[str, int]:
    """Get the stat changes for a specific option"""
    if event_template:
        for option in event_template.options:
            if option.key == option_key:
                return option.deltas
    
    # Fallback: search all events (including custom)
    all_events = get_all_available_events()
    for event in all_events:
        for option in event.options:
            if option.key == option_key:
                return option.deltas
    
    # Default if nothing found
    return {"morale": 0, "supplies": 0, "threat": 0}

