# Notification System Implementation

## Overview

This implementation adds automated notifications to theSimulation using Nolofication v2 with category-based scheduling. Notifications are sent when day transitions occur, and Nolofication handles delivery timing based on user preferences.

## What Was Added

### 1. Nolofication Service Module (Updated)
**File**: `server/utils/nolofication.py`

- Provides a reusable service class for sending notifications via Nolofication API v2
- **NEW**: Supports notification categories for user-controlled scheduling
- Supports single and bulk notifications
- Includes HTML email support with fallback to plain text
- Gracefully handles cases where Nolofication is not configured

### 2. Day Notification Script (New)
**File**: `server/scripts/send_day_notifications.py`

- **`send_day_result_notifications()`**: Sends results when a day is finalized
  - Category: `day_results`
  - Includes event headline, winning option, updated stats
  - Rich HTML email with gradient design and stat indicators
  
- **`send_vote_reminder_for_new_day()`**: Sends vote prompts when a new day begins
  - Category: `vote_reminders`
  - Includes new event details and call-to-action
  - Attractive HTML email encouraging participation

- Can be run manually for testing: `python server/scripts/send_day_notifications.py`

### 3. Integration with Day Lifecycle
**File**: `server/routes/api.py` (modified)

- **`finalize_day()`**: Calls `send_day_result_notifications()` after applying vote results
- **`ensure_today()`**: Calls `send_vote_reminder_for_new_day()` after creating new day
- Notifications fire automatically when days transition (no scheduler needed!)
- Errors in notifications don't block day transitions

### 4. Removed Scheduler
**File**: `server/__init__.py` (modified)

- **REMOVED**: APScheduler and vote reminder scheduling
- **REASON**: Nolofication v2 handles scheduling, we just send notifications instantly
- Simpler architecture, fewer dependencies

### 5. Dependencies
**File**: `server/requirements.txt` (modified)

- **REMOVED**: `apscheduler==3.10.4` (no longer needed)

### 6. Documentation
**Files**: `README.md` (modified)

- Updated notification section to explain category system
- Documented how scheduling works
- Added information about user control over notification timing
- Removed references to 10pm EST scheduling (now user-controlled)

## Configuration

Add these environment variables to your `.env` file:

```bash
# Optional - if not configured, app works normally without notifications
NOLOFICATION_URL=https://nolofication.bynolo.ca
NOLOFICATION_SITE_ID=thesimulation
NOLOFICATION_API_KEY=your_api_key_here
```

## How It Works

1. **Day Finalization** (automatic at midnight EST or manual admin tick):
   - System calculates winning vote and applies stat changes
   - `finalize_day()` calls `send_day_result_notifications()`
   - Notification sent with `day_results` category
   - Nolofication queues notification for each user based on their schedule preference

2. **New Day Creation** (automatic after finalization):
   - System creates new day with fresh event
   - `ensure_today()` calls `send_vote_reminder_for_new_day()`
   - Notification sent with `vote_reminders` category
   - Nolofication queues notification for each user based on their schedule preference

3. **Notification Delivery** (handled by Nolofication):
   - Users can set different schedules for each category:
     - **Instant**: Receive immediately (default)
     - **Daily**: Batched and sent once per day at preferred time (e.g., 9am, 6pm)
     - **Weekly**: Batched and sent once per week on preferred day/time
   - Users choose delivery channels (email, web push, Discord, webhooks)
   - Multi-channel delivery based on user preferences
   - Rich HTML emails with fallback to plain text

4. **User Control**:
   - Users manage preferences at https://nolofication.bynolo.ca
   - Can disable categories they don't want
   - Can change schedule per category
   - Can choose notification channels

## Testing

### Manual Test
Run the script directly to test notifications:

```bash
cd /home/sam/theSimulation
source server/.venv/bin/activate
python server/scripts/send_day_notifications.py
```

This will send both day results and vote reminders for the current day.

### Check Logs
The script logs all activity:
- Info when notifications are sent successfully
- Warning if Nolofication is not configured
- Error if API calls fail

### Verify Delivery
1. Check your email inbox (based on your Nolofication preferences)
2. Visit https://nolofication.bynolo.ca/notifications to see notification history
3. Check Nolofication dashboard for delivery status
4. Verify scheduling: notifications are queued based on user preferences

### Test Day Transitions
The best way to test is to trigger a day transition:
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Tick Day" to manually advance the day
4. Both notifications should be sent:
   - Day results for the completed day
   - Vote reminder for the new day

## Features

### Notification Categories

1. **Day Results** (`day_results`)
   - Sent when a day is finalized
   - Includes event headline, winning option, updated stats
   - Rich HTML email with gradient design
   - Color-coded stat indicators (green/yellow/red)
   - Direct link to view full simulation

2. **Vote Reminders** (`vote_reminders`)
   - Sent when a new day begins
   - Includes new event details
   - Call-to-action button to vote
   - Engaging design to encourage participation

### User Control & Flexibility
- Users configure their own schedule per category
- Can disable categories they don't want
- Choose delivery channels (email, push, Discord, webhooks)
- Instant, daily, or weekly delivery options
- No hardcoded timing - fully user-controlled

### Graceful Degradation
- App works normally even if Nolofication is not configured
- Logs warnings instead of errors when notifications are disabled
- No impact on core voting functionality
- Day transitions work regardless of notification status

### Efficient
- Bulk API calls for all users (not individual calls)
- Notifications sent at natural transition points (day tick)
- Minimal resource usage
- No polling or scheduled tasks needed

## Next Steps

To activate this feature:

1. **Register with Nolofication**: Contact the Nolofication admin to register theSimulation site and create categories
2. **Create Categories**: Ensure these categories exist in Nolofication:
   - `day_results` - For day finalization notifications
   - `vote_reminders` - For new day voting prompts
3. **Get API Key**: Save the API key from registration
4. **Configure Environment**: Add the three NOLOFICATION_* variables to `.env`
5. **Restart Server**: The notifications will fire automatically on day transitions

## User Experience

Users will receive notifications based on their preferences:

### Day Results Notification

**Subject**: 📊 The Simulation Day Results

**Body Preview**: 
> Day X results: Community chose 'Option Name'. Morale: 75, Supplies: 80, Threat: 25

**HTML Email** includes:
- Gradient header with day number
- Event headline and description
- Highlighted community decision
- Color-coded stat indicators (🟢🟡🔴)
- View Full Details button
- Clean, professional design

### Vote Reminder Notification

**Subject**: 🗳️ New Day in The Simulation - Vote Now!

**Body Preview**:
> A new challenge awaits! [Event Headline]. Cast your vote to shape the community's future.

**HTML Email** includes:
- Gradient header announcing new day
- Day number badge
- Event headline and description
- Blue info box emphasizing importance
- Large "Cast Your Vote" button
- Encouraging footer text

### User Control

Users can manage their notification preferences at https://nolofication.bynolo.ca:
- Set different schedules for `day_results` vs `vote_reminders`
- Choose instant, daily digest (with preferred time), or weekly summary
- Select notification channels (email, web push, Discord, webhooks)
- Disable categories they don't want
- All changes take effect immediately

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Day Lifecycle (server/routes/api.py)                    │
│  ├─ finalize_day() - Apply vote results                 │
│  │   └─ send_day_result_notifications() ────────┐       │
│  │                                               │       │
│  └─ ensure_today() - Create new day              │       │
│      └─ send_vote_reminder_for_new_day() ────────┼──┐    │
└──────────────────────────────────────────────────┼──┼────┘
                                                   │  │
                                                   ▼  ▼
┌─────────────────────────────────────────────────────────┐
│ Notification Scripts (scripts/send_day_notifications.py)│
│  ├─ send_day_result_notifications()                     │
│  │   ├─ Category: 'day_results'                         │
│  │   └─ Generate: Rich HTML email with stats            │
│  │                                                       │
│  └─ send_vote_reminder_for_new_day()                    │
│      ├─ Category: 'vote_reminders'                      │
│      └─ Generate: HTML email with CTA                   │
│                                                          │
│  Both call: NoloficationService.send_bulk_notification  │
└───────────────────────────────────────────────┬─────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────┐
│ Nolofication Service (utils/nolofication.py)            │
│  ├─ Build: API request with category + auth headers     │
│  └─ POST: https://nolofication.bynolo.ca/api/...        │
└───────────────────────────────────────────────┬─────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────┐
│ Nolofication Platform (External Service)                │
│  ├─ Queue: Notifications per user + category            │
│  ├─ Schedule: Based on user preferences                 │
│  │   • Instant delivery (default)                       │
│  │   • Daily digest at preferred time                   │
│  │   • Weekly summary on preferred day                  │
│  ├─ Process: User preferences (channels/timing)         │
│  └─ Deliver: Via user's chosen channels                 │
│      • Email (rich HTML + plain text fallback)          │
│      • Web push notifications                           │
│      • Discord messages                                 │
│      • Webhooks                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Differences from Old System:**
- ❌ **Removed**: APScheduler, scheduled jobs at 10pm
- ✅ **Added**: Event-driven notifications on day transitions
- ✅ **Added**: Category support for user-controlled scheduling
- ✅ **Added**: Day result notifications (not just vote reminders)
- ✅ **Simplified**: Let Nolofication handle all scheduling logic

## Maintenance

- **Monitor logs** for notification delivery status in application logs
- **Check rate limits** - Nolofication has 100 requests/hour per site
- **Update templates** - Edit the HTML in `send_day_notifications.py` as needed
- **No timing adjustments needed** - Users control their own schedules
- **Category management** - Ensure categories exist in Nolofication:
  - `day_results`
  - `vote_reminders`
- **Test after updates** - Run manual test script to verify notifications work
