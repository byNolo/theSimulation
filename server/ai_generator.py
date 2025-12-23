import json
import logging
from .llm import generate_text
from .models import WorldState, Event

logger = logging.getLogger(__name__)

def generate_daily_event(world_state: WorldState, day_number: int, recent_history: list = None):
    """
    Generate a unique daily event based on the current world state and recent history.
    """
    system_prompt = """You are the AI Dungeon Master for 'The Simulation', a post-apocalyptic community survival game.
Your goal is to generate a unique, engaging daily event that forces the community to make a difficult choice.
The event should be consistent with the current state of the world (Morale, Supplies, Threat) and recent history.

Output MUST be valid JSON with the following structure:
{
    "headline": "Short, punchy headline (max 50 chars)",
    "description": "2-3 sentences describing the situation. Be atmospheric.",
    "options": [
        {
            "key": "option_a",
            "label": "Short Action Label (max 20 chars)",
            "description": "Tooltip explaining the action and potential consequences",
            "deltas": {"morale": 0, "supplies": 0, "threat": 0, "population": 0}
        },
        {
            "key": "option_b",
            "label": "Short Action Label",
            "description": "Tooltip",
            "deltas": {"morale": 0, "supplies": 0, "threat": 0, "population": 0}
        },
        {
            "key": "option_c",
            "label": "Short Action Label",
            "description": "Tooltip",
            "deltas": {"morale": 0, "supplies": 0, "threat": 0, "population": 0}
        }
    ],
    "category": "crisis" | "opportunity" | "narrative" | "general"
}

Guidelines for Deltas:
- Values should range from -20 to +20 usually.
- Crisis events should have mostly negative trade-offs.
- Opportunity events should have mostly positive trade-offs.
- Population changes should be rare and small (-2 to +2), unless it's a major event.
"""

    history_text = "None"
    if recent_history:
        history_text = "\n".join([f"- Day {h['day']}: {h['headline']} (Choice: {h['choice']})" for h in recent_history])

    user_prompt = f"""
    Current Day: {day_number}
    
    World Stats:
    - Morale: {world_state.morale}/100
    - Supplies: {world_state.supplies}/100
    - Threat: {world_state.threat}/100
    - Population: {getattr(world_state, 'population', 20)}
    
    Recent History:
    {history_text}
    
    Generate a new event for today that fits the narrative continuity.
    """
    
    try:
        response = generate_text(system_prompt, user_prompt, temperature=0.8)
        if not response:
            return None
            
        # Clean up response if it contains markdown code blocks
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
            
        event_data = json.loads(response)
        return event_data
    except Exception as e:
        logger.error(f"Error parsing AI event generation: {e}")
        return None

def generate_day_summary(day_id: int, event_headline: str, chosen_option: str, outcome_deltas: dict, disaster: str = None):
    """
    Generate a narrative summary of the day's results.
    """
    system_prompt = """You are the Chronicler of a post-apocalyptic community.
Write a short, atmospheric journal entry (2-3 sentences) summarizing the day's events and the outcome of the community's decision.
Tone: Gritty, realistic, slightly hopeful or despairing depending on the outcome.
"""

    user_prompt = f"""
    Event: {event_headline}
    Community Choice: {chosen_option}
    
    Outcome:
    - Morale Change: {outcome_deltas.get('morale', 0)}
    - Supplies Change: {outcome_deltas.get('supplies', 0)}
    - Threat Change: {outcome_deltas.get('threat', 0)}
    - Population Change: {outcome_deltas.get('population', 0)}
    
    Disaster Occurred: {disaster or 'None'}
    
    Write the journal entry.
    """
    
    return generate_text(system_prompt, user_prompt, temperature=0.7)

def generate_community_chatter(event_headline: str, world_state: WorldState):
    """
    Generate a list of fake user comments reacting to the current situation.
    """
    system_prompt = """You are generating social media comments for a community survival app.
Generate 3-5 top-level user comments reacting to the current event.
For some comments, include 1-2 replies from other users.
Users are scared, hopeful, angry, or practical.
Use internet slang, hashtags, and emojis sparingly.

Output MUST be a valid JSON array of objects:
[
  {
    "content": "Top level comment",
    "replies": ["Reply 1", "Reply 2"]
  },
  ...
]
"""

    user_prompt = f"""
    Event: {event_headline}
    
    Stats:
    - Morale: {world_state.morale} (Low morale = despair/anger, High = hope)
    - Supplies: {world_state.supplies} (Low = hunger/begging)
    - Threat: {world_state.threat} (High = fear/paranoia)
    
    Generate comments with replies.
    """
    
    try:
        response = generate_text(system_prompt, user_prompt, temperature=0.8)
        if not response:
            return []
            
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
            
        return json.loads(response)
    except Exception as e:
        logger.error(f"Error parsing AI chatter: {e}")
        return []
