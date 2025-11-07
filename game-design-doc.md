Mecha Hero Design Document
Game Overview

Title: Mecha Hero
Jam: Mini Jam 197: Recursion
Genre: Rhythm-action quick-time event (QTE) fighter
Platform: Web (HTML/JS single-page)
Core Loop: Respond to enemy mecha poses by selecting the correct counter-attack from 4 options within a time limit. Complete sequences to progress through fights.
Win Condition: Successfully counter all 4 poses in each of 3 escalating fights.
Lose Condition: Deplete 3 player hearts via incorrect selections or timeouts.
Replayability: Procedural shuffle of pose order per fight.

Core Mechanics

Enemy Poses: 4 distinct mecha poses, each requiring a specific player counter.
Player Actions: 4 attack buttons (Shield Bash, Rocket Fist, Sword Slash, Plasma Dodge).
Response Rules:

Correct selection: Advances to next pose.
Wrong selection: Loses 1 heart; retries current pose.
Timeout: Loses 1 heart; retries current pose.

Hearts System: Player starts with 3 hearts. No regeneration. 0 hearts = game over.
Timer: Per-pose countdown bar. Duration decreases per fight.
Sequence Requirement: Must complete all 4 poses correctly in shuffled order to win a fight. No enemy health bar; success is sequence completion.

Pose-Response Mapping

Pose #Enemy Pose DescriptionCorrect Player AttackCounter Flavor Text1Arm Cocked High (glowing elbow joint, overhead wind-up)Shield BashBlocks the downward smash, stunning the arm for a riposte crack.2Leg Sweep Low (knee vents hissing, ground tremor effect)Rocket FistLaunches you airborne, dodging the trip and counter-stomping the vents.3Torso Twist (shoulder pauldrons rotating, feint sparks)Sword SlashSlices through the spin, exploiting the exposed core mid-rotation.4Chest Burst (reactor core pulsing red, exhaust flare)Plasma DodgeSidesteps the beam, circling back for a charged overload shot.
Progression

Fights: 3 total, against the same enemy mecha.
Time Crystal Mechanic: After each fight win, enemy uses time crystal to rewind (visual/audio cue) and accelerate to next fight.
Fight Timers:

Fight 1: 5 seconds per pose.
Fight 2: 3 seconds per pose.
Fight 3: 1.5 seconds per pose.

Between Fights: Brief "rewind" message and delay before next fight starts with shuffled poses.
Overall Flow:

Start Fight 1.
Complete 4-pose sequence → Rewind cue → Fight 2.
Repeat for Fight 3.
Complete Fight 3 → Victory ("Crystal Shattered").

Failure Handling: Heart loss retries current pose. Game over restarts full game.

UI/UX Elements

Hearts Display: 3 icons (full/empty states) in top-left.
Fight Counter: "Fight: X/3" in top-right.
Timer Bar: Crystal-shaped progress bar draining per pose.
Enemy Pose Area: Central display for pose image/description.
Attack Buttons: 2x2 grid with icons and labels.
Message Area: Displays current pose info, feedback (e.g., "Counter! Perfect.", "Wrong! Hit taken.", "Timeout!"), fight complete cues, victory/game over text.
Restart Button: Appears on game over or victory for full reset.
Input: Mouse clicks on buttons. Buttons disabled during transitions/timeouts.
