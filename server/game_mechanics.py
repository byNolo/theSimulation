"""
Advanced game mechanics for The Simulation.
Handles passive decay, project buffs, cascade failures, and random disasters.
"""
import random
import logging

logger = logging.getLogger(__name__)


def get_completed_project_buffs():
    """Calculate total buffs from all completed projects"""
    from .models_projects import CompletedProject
    from .db import db
    
    try:
        completed = CompletedProject.query.all()
        buffs = {
            'morale_buff': 0,
            'supplies_buff': 0,
            'threat_reduction': 0,
            'decay_reduction': 0,
            'production_bonus': 0,
            'population_capacity': 0
        }
        
        for cp in completed:
            project = cp.project
            buff_type = project.buff_type
            buff_value = project.buff_value
            
            if buff_type in buffs:
                buffs[buff_type] += buff_value
            elif buff_type == 'morale':
                buffs['morale_buff'] += buff_value
            elif buff_type == 'supplies':
                buffs['supplies_buff'] += buff_value
            elif buff_type == 'threat':
                buffs['threat_reduction'] += buff_value
                
        return buffs
    except Exception as e:
        logger.error(f"Error getting project buffs: {e}")
        return {
            'morale_buff': 0,
            'supplies_buff': 0,
            'threat_reduction': 0,
            'decay_reduction': 0,
            'production_bonus': 0,
            'population_capacity': 0
        }


def calculate_passive_decay(morale, supplies, threat, population, buffs):
    """
    Calculate daily passive decay of stats.
    Returns dict with decay amounts for each stat.
    
    Base decay:
    - Supplies: -3 to -6 per day (population consumption)
    - Morale: -1 to -3 per day (stress of survival)
    - Threat: +1 to +3 per day (world gets more dangerous)
    
    Modified by:
    - Population size (more people = more supply drain)
    - Current stat levels (low morale increases decay)
    - Completed projects (reduce decay)
    """
    
    # Base decay values
    base_supply_decay = -4
    base_morale_decay = -2
    base_threat_increase = 2
    
    # Population modifier (each person beyond 20 increases supply drain)
    population_modifier = max(0, (population - 20)) * 0.2
    supply_decay = base_supply_decay - population_modifier
    
    # Low morale increases supply decay (people are less efficient)
    if morale < 40:
        supply_decay -= 2
    
    # Low supplies decreases morale (hungry people are unhappy)
    morale_decay = base_morale_decay
    if supplies < 40:
        morale_decay -= 2
    
    # High threat increases morale decay (fear and stress)
    if threat > 60:
        morale_decay -= 2
    
    # Threat naturally grows unless actively reduced
    threat_increase = base_threat_increase
    
    # Apply project buffs
    decay_reduction = buffs.get('decay_reduction', 0)
    
    # Decay reduction is percentage based (e.g., 20 = 20% reduction)
    if decay_reduction > 0:
        reduction_factor = (100 - decay_reduction) / 100
        supply_decay = int(supply_decay * reduction_factor)
        morale_decay = int(morale_decay * reduction_factor)
        threat_increase = int(threat_increase * reduction_factor)
    
    # Apply direct stat buffs from projects
    supply_decay += buffs.get('supplies_buff', 0)
    morale_decay += buffs.get('morale_buff', 0)
    threat_increase -= buffs.get('threat_reduction', 0)
    
    return {
        'morale': morale_decay,
        'supplies': int(supply_decay),
        'threat': threat_increase
    }


def check_cascade_failures(morale, supplies, threat):
    """
    Check for cascade failures - when one low stat triggers penalties to others.
    Returns additional penalties to apply.
    """
    penalties = {'morale': 0, 'supplies': 0, 'threat': 0}
    
    # Critical morale causes supply problems (people stop working efficiently)
    if morale < 25:
        penalties['supplies'] -= 5
        logger.info("CASCADE: Critical morale causing supply problems")
    
    # Critical supplies causes morale collapse and threat increase
    if supplies < 25:
        penalties['morale'] -= 5
        penalties['threat'] += 5
        logger.info("CASCADE: Critical supplies causing morale collapse and increased threat")
    
    # High threat causes morale problems
    if threat > 75:
        penalties['morale'] -= 5
        logger.info("CASCADE: High threat causing morale problems")
    
    # Multiple critical stats compound the problem
    critical_count = sum([morale < 25, supplies < 25, threat > 75])
    if critical_count >= 2:
        penalties['morale'] -= 5
        penalties['supplies'] -= 5
        penalties['threat'] += 5
        logger.info(f"CASCADE: Multiple critical stats ({critical_count}) compounding problems!")
    
    return penalties


def roll_random_disaster(morale, supplies, threat):
    """
    15% chance per day of a random disaster occurring.
    Returns dict with disaster details or None.
    """
    if random.random() > 0.15:
        return None
    
    disasters = [
        {
            'name': 'Sudden Storm',
            'description': 'A violent storm damages shelter and depletes supplies',
            'deltas': {'morale': -8, 'supplies': -12, 'threat': 0}
        },
        {
            'name': 'Equipment Failure',
            'description': 'Critical equipment breaks down unexpectedly',
            'deltas': {'morale': -6, 'supplies': -8, 'threat': 3}
        },
        {
            'name': 'Illness Outbreak',
            'description': 'Several people fall ill without warning',
            'deltas': {'morale': -10, 'supplies': -6, 'threat': 0}
        },
        {
            'name': 'Hostile Scouts',
            'description': 'Unfriendly groups spotted nearby',
            'deltas': {'morale': -5, 'supplies': 0, 'threat': 12}
        },
        {
            'name': 'Supply Spoilage',
            'description': 'Some of the food stores have gone bad',
            'deltas': {'morale': -4, 'supplies': -15, 'threat': 0}
        },
        {
            'name': 'Accident',
            'description': 'A work accident injures someone and damages equipment',
            'deltas': {'morale': -8, 'supplies': -8, 'threat': 5}
        },
        {
            'name': 'Theft',
            'description': 'Supplies have gone missing - stolen or misplaced',
            'deltas': {'morale': -12, 'supplies': -10, 'threat': 8}
        },
        {
            'name': 'Wildlife Attack',
            'description': 'Dangerous animals raid the settlement',
            'deltas': {'morale': -6, 'supplies': -8, 'threat': 10}
        },
    ]
    
    # Weight disasters based on current state
    # More likely to get worse disasters when stats are already bad
    if supplies < 40 or morale < 40 or threat > 60:
        # Higher chance of severe disaster
        disaster = random.choice(disasters)
        # Amplify the disaster in bad situations
        disaster = disaster.copy()
        disaster['deltas'] = {k: int(v * 1.3) for k, v in disaster['deltas'].items()}
        disaster['description'] += ' (CRITICAL)'
    else:
        disaster = random.choice(disasters)
    
    logger.info(f"RANDOM DISASTER: {disaster['name']}")
    return disaster


def apply_production_to_project(world_state, buffs):
    """
    Apply daily production to the active project.
    Production is based on morale and supplies.
    """
    from .models_projects import ActiveProject
    from .db import db
    
    try:
        active_project = ActiveProject.query.first()
        if not active_project:
            return None
        
        # Base production formula
        base_production = int((world_state.morale * 0.15) + (world_state.supplies * 0.15))
        
        # Apply production bonus from completed projects
        production_bonus = buffs.get('production_bonus', 0)
        total_production = base_production + production_bonus
        
        # Low population reduces production
        if world_state.population < 15:
            total_production = int(total_production * 0.7)
        
        # Cannot produce if stats too low
        if world_state.morale < 20 or world_state.supplies < 20:
            total_production = int(total_production * 0.3)
            
        active_project.progress += total_production
        
        # Check if project completed
        if active_project.progress >= active_project.project.cost:
            from .models_projects import CompletedProject
            
            # Mark as completed
            completed = CompletedProject(
                project_id=active_project.project_id,
            )
            db.session.add(completed)
            
            # Remove from active
            project_name = active_project.project.name
            db.session.delete(active_project)
            db.session.commit()
            
            logger.info(f"PROJECT COMPLETED: {project_name}")
            return {
                'completed': True,
                'name': project_name,
                'production': total_production
            }
        
        db.session.commit()
        logger.info(f"Project production: +{total_production} progress")
        return {
            'completed': False,
            'production': total_production,
            'progress': active_project.progress,
            'target': active_project.project.cost
        }
        
    except Exception as e:
        logger.error(f"Error applying production: {e}")
        return None


def calculate_population_change(morale, supplies, threat, current_population):
    """
    Population can grow or shrink based on conditions.
    Good conditions = people join, bad conditions = people leave or die.
    """
    change = 0
    
    # Good conditions attract newcomers
    # Relaxed conditions: Morale > 60, Supplies > 60, Threat < 40
    if morale > 60 and supplies > 60 and threat < 40:
        if random.random() < 0.20:  # Increased to 20% chance
            change = random.randint(1, 2)
            logger.info(f"POPULATION GROWTH: +{change} (good conditions)")
    
    # Bad conditions cause people to leave or die
    if morale < 25 or supplies < 25:
        if random.random() < 0.25:  # 25% chance
            change = -random.randint(1, 2)
            logger.info(f"POPULATION LOSS: {change} (harsh conditions)")
    
    # Extreme threat causes casualties
    if threat > 80:
        if random.random() < 0.20:  # 20% chance
            change = -random.randint(1, 3)
            logger.info(f"POPULATION LOSS: {change} (high threat)")
    
    # Don't go below minimum viable population
    new_population = max(10, current_population + change)
    
    # Cap at reasonable maximum
    max_pop = 50 + get_completed_project_buffs().get('population_capacity', 0)
    new_population = min(max_pop, new_population)
    
    return new_population


def check_and_start_project():
    """
    Check if there is no active project, and if so, start the one with the most votes.
    Returns dict with info about started project or None.
    """
    from .models_projects import ActiveProject, ProjectVote, Project, CompletedProject
    from .db import db
    
    try:
        # Check if there's already an active project
        if ActiveProject.query.first():
            return None
            
        # Get all votes
        votes = ProjectVote.query.all()
        if not votes:
            return None
            
        # Tally votes
        tally = {}
        for v in votes:
            tally[v.project_id] = tally.get(v.project_id, 0) + 1
            
        if not tally:
            return None
            
        # Pick winner (most votes, tie-break by ID)
        winner_id = max(tally, key=lambda k: (tally[k], -k))
        
        # Verify not already completed (shouldn't happen if UI is correct, but safety check)
        if CompletedProject.query.filter_by(project_id=winner_id).first():
            logger.warning(f"Winner project {winner_id} already completed, skipping")
            # Could delete votes here, but let's just return for now
            return None
            
        # Start the project
        new_active = ActiveProject(project_id=winner_id)
        db.session.add(new_active)
        
        project = Project.query.get(winner_id)
        project_name = project.name if project else f"Project {winner_id}"
        
        # Clear votes
        ProjectVote.query.delete()
        
        db.session.commit()
        logger.info(f"PROJECT STARTED: {project_name}")
        
        return {
            'started': True,
            'name': project_name
        }
        
    except Exception as e:
        logger.error(f"Error starting project: {e}")
        return None
