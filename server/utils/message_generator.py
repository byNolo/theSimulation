import random
from typing import List, Dict, Optional
from ..models import CommunityMessage, WorldState

# Names for fake users
NAMES = [
    "Alex", "Sam", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Jamie", "Quinn", "Avery",
    "Skyler", "Cameron", "Reese", "Peyton", "Dakota", "Charlie", "Sage", "Rowan", "Finley", "Emerson"
]

# Templates based on categories and stats
TEMPLATES = {
    "crisis": {
        "high_threat": [
            "Is anyone else hearing those noises at night? #scared",
            "We need to do something about the perimeter. It's not safe.",
            "I don't feel safe sleeping anymore.",
            "Did you see the guards running earlier? What's happening?",
            "My kids are terrified. When will this end?",
            "Anyone else hear shouting near the east wall?",
            "Why are the alarms glitching again??",
            "Something is moving out there. Not an animal.",
            "Everyone stay inside. Seriously.",
            "I don't think the guards can handle what's coming.",
            "Why was the watchtower light on all night?",
            "People are disappearing and nobody's talking about it.",
            "I saw shadows by the fence. Big ones.",
            "Can someone check the cameras? Half of them are offline."
        ],
        "low_supplies": [
            "Rations are getting smaller every day...",
            "Does anyone have extra medicine? My partner is sick.",
            "I'm so hungry. We need to find food soon.",
            "Why aren't we doing more to find supplies?",
            "Trading my watch for canned goods. DM me.",
            "We're down to scraps. This isn't sustainable.",
            "Sharing between families only works for so long...",
            "I've never felt hunger like this.",
            "If anyone has baby formula, please DM me.",
            "We can't keep pretending everything is fine.",
            "Water tastes weird today. Anyone else?",
            "I'd kill for a real meal right now.",
            "We should organize a scavenging team soon.",
            "Trading: batteries for bread?",
            "People are fighting over crumbs now."
        ],
        "low_morale": [
            "What's the point of all this?",
            "I miss the old world.",
            "Thinking about leaving. It can't be worse out there.",
            "Everyone is so on edge lately.",
            "Just want to give up.",
            "I'm tired of pretending I'm okay.",
            "Can't shake this hopeless feeling.",
            "Every day is the same. And worse.",
            "I miss sunlight that didn't feel dangerous.",
            "Nobody smiles anymore.",
            "Feels like we're all ghosts walking around.",
            "I don't know how much longer I can do this.",
            "Thinking about my old life way too much.",
            "This place eats away at you.",
            "Some days I don't see the point."
        ],
        "general": [
            "This is getting out of hand.",
            "We need strong leadership right now.",
            "Stay safe everyone.",
            "Lock your doors tonight.",
            "Praying for us all.",
            "Anyone have updates? Rumors are going wild.",
            "We need answers, not silence.",
            "This level of tension isn't normal.",
            "I feel like we're being kept in the dark.",
            "Stay alert tonight everyone.",
            "People need to look out for one another right now.",
            "Something is definitely off.",
            "We need a community meeting ASAP.",
            "Prepare yourselves for anything.",
            "No matter what happens, don't panic."
        ]
    },
    "opportunity": {
        "general": [
            "Finally some good news!",
            "Things are looking up.",
            "Let's make the most of this.",
            "Hope this changes things for the better.",
            "We needed a win.",
            "Finally something good for once!",
            "This might actually change our direction.",
            "Feeling hopeful today.",
            "We needed this boost.",
            "Let's not waste this chance.",
            "Everyone seems a bit lighter today.",
            "Maybe things *can* get better.",
            "This is exactly what we needed right now.",
            "Can't believe we're catching a break.",
            "Hope is contagious lol."
        ],
        "high_supplies": [
            "Feast tonight! 🍖",
            "So grateful for the extra food.",
            "Maybe we can actually thrive here.",
            "Does anyone need extra blankets? I have some now.",
            "Let's save some for later.",
            "Never thought I'd eat this well again!",
            "Bless whoever found this stash.",
            "We should celebrate tonight!",
            "My pack is finally full again.",
            "Sharing really paid off today.",
            "Feels like we struck gold!",
            "We finally get to restock the meds!",
            "Anyone need tools? I have extras now.",
            "Let's ration this smartly.",
            "Feels like a holiday lol."
        ]
    },
    "narrative": {
        "general": [
            "Did you hear the rumors?",
            "Something big is happening.",
            "I have a bad feeling about this.",
            "This changes everything.",
            "We should be careful.",
            "Whispers are spreading fast...",
            "Something's brewing behind the scenes.",
            "I overheard something I probably shouldn't have.",
            "This storyline is getting wild.",
            "Anyone else sense a shift coming?",
            "I feel like we're on the verge of something big.",
            "People in high places are acting strange.",
            "The tension before a big event is unreal.",
            "This can't all be coincidence.",
            "Connect the dots... it's getting obvious."
        ]
    },
    "general": {
        "general": [
            "Just another day in paradise.",
            "Anyone want to trade shifts?",
            "Beautiful sunset today.",
            "Working on the garden if anyone wants to help.",
            "Stay strong community.",
            "Morning everyone. Hope it's a good one.",
            "Anyone want to help with repairs later?",
            "Nice breeze today for once.",
            "Anyone down for a community game later?",
            "Got some free time if anyone needs help.",
            "Just checking in. Y'all good?",
            "Heard music earlier… who was playing?",
            "Trying to stay positive.",
            "Gardening helps. Highly recommend.",
            "Little moments of peace matter a lot."
        ]
    }
}

# Templates that reference specific context
CONTEXT_TEMPLATES = [
    "I can't believe we chose {option_label}. What were we thinking?",
    "Glad we went with {option_label}. It was the only choice.",
    "{option_label} seemed risky, but maybe it will pay off.",
    "Regarding {event_headline}: I hope we're ready.",
    "At least we're doing something about {event_headline}.",
    "I voted for {option_label} and I stand by it.",
    "Why did so many people vote for {option_label}?",
    "Not sure how I feel about {option_label} yet.",
    "Anyone else second-guessing {option_label}?",
    "Honestly, {option_label} shocked me. Didn't expect that result.",
    "Whatever happens with {option_label}, I hope we're ready.",
    "Regarding {event_headline}: trying not to panic.",
    "I keep thinking about {event_headline}. Hard to focus on anything else.",
    "Does {event_headline} worry anyone else?",
    "People are already fighting over {option_label}.",
    "We'll see if {option_label} was a mistake or not."
]

# Reply templates with sentiment mapping
REPLY_TEMPLATES = {
    "positive": [
        "Totally agree!",
        "100%.",
        "You said it.",
        "Glad someone said it.",
        "Exactly.",
        "Love this energy.",
        "Well said!",
        "Exactly my thoughts.",
        "Couldn't agree more.",
        "You're on the right track.",
        "Love this outlook.",
        "Facts."
    ],
    "negative": [
        "I don't think so.",
        "That's a bad take.",
        "We have to be realistic.",
        "Easy for you to say.",
        "I disagree.",
        "Are you serious?",
        "That's not how it works.",
        "You're oversimplifying it.",
        "Awful take honestly.",
        "Think again.",
        "Not even close.",
        "That's reckless thinking."
    ],
    "neutral": [
        "Interesting point.",
        "Maybe.",
        "We'll see.",
        "Time will tell.",
        "I hope you're right.",
        "Hmm, could go either way.",
        "Not sure about that.",
        "I'll think about it.",
        "Fair point.",
        "Let's wait and see.",
        "That's one way to look at it."
    ],
    "question": [
        "Are you sure?",
        "What makes you say that?",
        "Have you heard something?",
        "Is that confirmed?",
        "Who told you that?",
        "Where did you hear that?",
        "Is that reliable?",
        "What happened exactly?",
        "Do you have proof?",
        "Wait, really?",
        "How sure are you?"
    ]
}

def generate_messages_for_day(day_id: int, event_category: str, world_state: WorldState, 
                            event_headline: Optional[str] = None, 
                            chosen_option_label: Optional[str] = None) -> List[Dict]:
    """Generate a batch of fake messages based on the day's context"""
    
    messages = []
    num_messages = random.randint(3, 6)
    
    # Determine context
    context = "general"
    if event_category in TEMPLATES:
        context = event_category
    
    # Select templates based on stats
    available_templates = []
    
    # Add category specific templates
    if context in TEMPLATES:
        cat_templates = TEMPLATES[context]
        if "general" in cat_templates:
            available_templates.extend(cat_templates["general"])
            
        # Add stat-specific templates
        if world_state.threat > 70 and "high_threat" in cat_templates:
            available_templates.extend(cat_templates["high_threat"])
        if world_state.supplies < 30 and "low_supplies" in cat_templates:
            available_templates.extend(cat_templates["low_supplies"])
        if world_state.morale < 30 and "low_morale" in cat_templates:
            available_templates.extend(cat_templates["low_morale"])
        if world_state.supplies > 70 and "high_supplies" in cat_templates:
            available_templates.extend(cat_templates["high_supplies"])

    # Fallback
    if not available_templates:
        available_templates = TEMPLATES["general"]["general"]

    # Add context templates if we have context
    if chosen_option_label or event_headline:
        # Add them multiple times to increase weight
        for _ in range(3):
            t = random.choice(CONTEXT_TEMPLATES)
            formatted = t.format(
                option_label=chosen_option_label or "the decision",
                event_headline=event_headline or "the situation"
            )
            available_templates.append(formatted)

    for _ in range(num_messages):
        content = random.choice(available_templates)
        author = random.choice(NAMES)
        avatar_seed = f"{author}_{random.randint(0, 1000)}"
        
        # Simple sentiment logic
        sentiment = "neutral"
        if context == "crisis" or world_state.morale < 40:
            sentiment = "negative"
        elif context == "opportunity" or world_state.morale > 70:
            sentiment = "positive"

        msg_data = {
            "day_id": day_id,
            "author_name": author,
            "avatar_seed": avatar_seed,
            "content": content,
            "sentiment": sentiment,
            "replies": []
        }
        
        # Chance to generate replies
        if random.random() < 0.4: # 40% chance of replies
            num_replies = random.randint(1, 2)
            for _ in range(num_replies):
                # Determine reply type based on parent sentiment
                if sentiment == "positive":
                    # Mostly agree, sometimes question
                    reply_type = random.choices(["positive", "question", "neutral"], weights=[0.6, 0.2, 0.2])[0]
                elif sentiment == "negative":
                    # Mostly agree (commiserate) or disagree
                    reply_type = random.choices(["negative", "positive", "question"], weights=[0.5, 0.3, 0.2])[0]
                else:
                    reply_type = random.choice(["positive", "negative", "neutral", "question"])
                
                reply_content = random.choice(REPLY_TEMPLATES[reply_type])
                reply_author = random.choice([n for n in NAMES if n != author])
                
                msg_data["replies"].append({
                    "day_id": day_id,
                    "author_name": reply_author,
                    "avatar_seed": f"{reply_author}_{random.randint(0, 1000)}",
                    "content": reply_content,
                    "sentiment": "neutral" # Replies are usually neutral in display unless we want to color them too
                })
        
        messages.append(msg_data)
        
    return messages
