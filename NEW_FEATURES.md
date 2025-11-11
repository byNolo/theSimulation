# New Features Added - November 8-10, 2025

## ✅ 1. First-Time User Welcome Modal

**What it does:**
- Shows a beautiful welcome modal when users log in for the first time
- Explains what The Simulation is, how voting works, and the stakes
- Includes visual icons, stat explanations, and pro tips
- Uses localStorage to only show once per user
- Fully styled with glass-morphism effects matching the app theme

**Files:**
- `/web/src/components/WelcomeModal.tsx` - New component
- `/web/src/pages/Home.tsx` - Updated to include modal

**Trigger:** Automatically shows when user authenticates for the first time

---

## ✅ 2. Website Favicon

**What it does:**
- Professional favicon showing a stylized globe with stat dots
- SVG version (works immediately in all modern browsers)
- Generator tool for PNG versions at multiple sizes

**Files:**
- `/web/public/favicon.svg` - Main SVG favicon (already working!)
- `/web/public/generate-icons.html` - Tool to generate PNG versions
- `/web/public/ICONS_README.md` - Instructions
- `/web/index.html` - Updated with favicon references

**Status:** 
- ✅ SVG favicon live now
- 📝 Optional: Generate PNGs using the HTML tool for wider compatibility

---

## ✅ 3. Social Media Preview (Discord/Twitter/Facebook)

**What it does:**
- When you share `https://thesim.bynolo.ca` on Discord, Twitter, Facebook, etc., it shows:
  - **Title:** "The Simulation - A Multiplayer Social Experiment"
  - **Description:** "Shape a persistent world through collective choices. Vote daily on events that impact Morale, Supplies, and Threat."
  - **Image:** Custom OG image (1200x630px) with globe icon and branding
- Uses Open Graph and Twitter Card meta tags

**Files:**
- `/web/index.html` - Added comprehensive meta tags
- `/web/public/generate-icons.html` - Can generate og-image.png

**Status:**
- ✅ Meta tags live
- 📝 Optional: Generate and upload `og-image.png` for rich preview image

---

## ✅ 4. Vote Changing (November 10, 2025)

**What it does:**
- Users can now change their vote if they accidentally clicked the wrong option
- Shows which option the user voted for with visual indicators
- Displays message "You can change your vote"
- Tracks vote changes in telemetry for analytics

**Backend Changes:**
- **`server/models.py`**: Added `updated_at` timestamp to `Vote` model
- **`server/routes/api.py`**: 
  - Modified `/api/vote` endpoint to update existing votes instead of returning error
  - Added `/api/my-vote` endpoint to retrieve user's current vote
  - Logs vote changes with event type `vote_changed`

**Frontend Changes:**
- **`web/src/components/EventCard.tsx`**:
  - Accepts `currentVote` prop to highlight user's current selection
  - Shows banner indicating which option the user voted for
  - Adds visual ring around the selected option
  - Displays "Your vote" badge on chosen option
- **`web/src/pages/Home.tsx`**:
  - Fetches current vote status on load
  - Updates UI when vote is changed
  - Shows different messages for initial vote vs. vote change
- **`web/src/services/api.ts`**: Added `getMyVote()` function

**Migration Required:**
```bash
cd server
.venv/bin/python scripts/add_vote_updated_at.py
```

---

## ✅ 5. Event History (November 10, 2025)

**What it does:**
- Users can now view the history of past events
- See what options were presented and which option won
- View voting results with percentages
- See world state (morale, supplies, threat) at that time
- Expandable/collapsible cards for easy browsing

**Backend Changes:**
- **`server/routes/api.py`**: Added `/api/history` endpoint that returns:
  - Past 30 finalized days (days where voting concluded)
  - Event details (headline, description, options)
  - Chosen option with vote counts and percentages
  - World state at that time

**Frontend Changes:**
- **`web/src/components/EventHistory.tsx`**: New component that:
  - Displays past events in collapsible cards
  - Shows day number, date, and headline
  - Highlights the winning option
  - Expandable view shows full details with vote distribution
  - Visual progress bars for each option
  - World state stats at that time
- **`web/src/pages/Home.tsx`**: Displays EventHistory component below current event
- **`web/src/services/api.ts`**: 
  - Added `getHistory()` function
  - Renamed admin history to `getAdminHistory()` to avoid conflicts

**User Experience:**
1. Scroll down to see Event History section
2. Each event shows as a collapsed card with key info
3. Click to expand and see full details:
   - All options that were available
   - Vote distribution with percentages
   - Visual progress bars
   - World state metrics at that time
4. Green checkmark highlights the winning option

---

## Next Steps (Optional)

### To add PNG favicons and OG image:

1. Open in browser: `http://192.168.1.13:5160/generate-icons.html`
2. Right-click each canvas and "Save As":
   - Save `favicon16.png` as `favicon-16x16.png` in `/web/public/`
   - Save `favicon32.png` as `favicon-32x32.png` in `/web/public/`
   - Save `apple180.png` as `apple-touch-icon.png` in `/web/public/`
   - Save `ogimage.png` as `og-image.png` in `/web/public/`
3. Rebuild: `./run_prod.sh`

### Current Status:
- SVG favicon works right now ✅
- Social meta tags work right now ✅
- Welcome modal works right now ✅
- Vote changing works right now ✅
- Event history works right now ✅
- PNG icons are optional extras for maximum compatibility

---

## Test It Out

1. **Welcome Modal:** 
   - Clear localStorage: `localStorage.clear()` in browser console
   - Refresh and log in to see the modal

2. **Favicon:**
   - Check browser tab - should see globe icon

3. **Social Preview:**
   - Share `https://thesim.bynolo.ca` in Discord
   - Should show title, description, and preview card

4. **Vote Changing:**
   - Sign in and vote on the current event
   - Click a different option
   - Verify the vote updates and message shows "Changed vote to..."
   - Refresh the page and verify your new vote is still selected

5. **Event History:**
   - Scroll down to the Event History section
   - Click on a past event to expand it
   - Verify all data displays correctly
   - Test collapsing/expanding multiple events

---

All features are live! 🎉
