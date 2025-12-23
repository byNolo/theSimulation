"""
This file contains dramatic rebalances for all events.
All deltas have been amplified 2-3x to make choices matter significantly more.
"""

# This content will be integrated into events.py
# CRISIS EVENTS - REBALANCED (bigger swings)

CRISIS_REBALANCE = """
EventTemplate(
    id="food_shortage_critical",
    headline="Food Stores Critically Low!",
    description="The community's food supplies are nearly depleted. Desperate measures are needed.",
    category="crisis",
    max_supplies=25,  # Trigger earlier
    options=[
        Option("emergency_rationing", "Emergency Rationing", 
               {"morale": -15, "supplies": +25, "threat": +5},  # AMPLIFIED
               "Strict rationing might save us, but morale will suffer"),
        Option("desperate_hunt", "Desperate Hunt", 
               {"morale": +5, "supplies": +18, "threat": +18},  # AMPLIFIED + RISKIER
               "Risk sending everyone out to find food"),
        Option("negotiate_outsiders", "Seek Outside Help", 
               {"morale": -10, "supplies": +35, "threat": +28},  # AMPLIFIED + VERY RISKY
               "Reveal our location to potential traders"),
    ],
),

EventTemplate(
    id="morale_collapse",
    headline="Community on the Brink of Collapse",
    description="Despair has taken hold. People are talking about giving up or leaving.",
    category="crisis",
    max_morale=30,  # Trigger earlier
    options=[
        Option("inspirational_speech", "Rally the People", 
               {"morale": +25, "supplies": -8, "threat": 0},  # AMPLIFIED
               "Remind them why we fight to survive"),
        Option("festival", "Hold a Festival", 
               {"morale": +35, "supplies": -20, "threat": +10},  # AMPLIFIED + COSTLY
               "A celebration might lift spirits despite the cost"),
        Option("accept_reality", "Accept Losses", 
               {"morale": +10, "supplies": +10, "threat": -8},  # AMPLIFIED
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
               {"morale": -18, "supplies": -12, "threat": -35},  # AMPLIFIED
               "Seal everything and wait it out"),
        Option("preemptive_strike", "Preemptive Action", 
               {"morale": -10, "supplies": -15, "threat": -30},  # AMPLIFIED
               "Take the fight to them before they come to us"),
        Option("emergency_evacuation", "Emergency Relocation", 
               {"morale": -15, "supplies": -25, "threat": -40},  # AMPLIFIED + COSTLY
               "Abandon this location for a safer one"),
    ],
),
"""

# Continue with more events...
print("Event rebalance template created")
