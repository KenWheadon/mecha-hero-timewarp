Mecha Hero Design Document
Overview
Mecha Hero is a single-player rhythm-action game where the player counters enemy mecha poses by selecting the correct response within a time limit. The game progresses through 4 fights (levels), each with escalating difficulty via reduced timers, more poses, and procedural elements. The player has 3 hearts (lives); losing all ends the game. Success depletes the enemy's HP bar by countering all required poses. Visual feedback includes pose images, bars, and text prompts. The theme emphasizes recursion through time warps and accelerating patterns.
Core Mechanics

Poses and Responses: The enemy starts in a neutral stance (Pose 1). It shifts to an attack pose, revealing 2-4 player response buttons (Shield Bash, Rocket Fist, Sword Slash, Plasma Dodge). Each pose maps to one correct response.

Correct selection: Deals 1 damage to enemy HP, triggers "PERFECT COUNTER!" message, 500ms cooldown to neutral pose, advances to next pose.
Incorrect selection or timeout: Triggers "MISSED!" or "Timeout!" message, loses 1 heart, 1000ms cooldown, retries the same pose.

Timer: Green bar drains from full (10s/6s/4s/2s per level). Pauses on pause toggle.
Hearts: 3 icons (full/empty images). Deplete on miss/timeout; 0 hearts triggers game over.
Enemy HP: Red bar starts full (2/4/4/8 per level). Depletes by 1 per correct counter. Displays current/max HP in instruction text.
Crystal Energy: Cyan bar (2 charges max), visible from Level 2. Drains by 1 on time warp after Levels 2-3.
Pause: Toggles timer/buttons freeze; appends "(PAUSED)" to instruction; changes button to "Resume".
End States:

Game Over: "GAME OVER! Crystal Overload. Restart?" message, shows neutral pose.
Victory (Level 4): "TOTAL VICTORY! Robot Destroyed. Recursion Ended." message, shows destroyed pose (Pose 9).

Level Progression
Levels are sequential fights; completing one advances via animations.

Level 1 (2 HP, 10s timer):

2 unique poses (Arm Cocked High → Shield Bash; Leg Sweep Low → Rocket Fist), shown in random order.
No crystal bar.
On completion: Damaged pose (2s), time warp pose (5s), advance to Level 2.

Level 2 (4 HP, 6s timer):

4 unique poses (all attacks), random order.
Crystal starts at 2 charges; drains 1 on warp.
On completion: Damaged (2s), time warp (5s), advance.

Level 3 (4 HP, 4s timer):

4 unique poses, random order.
Crystal drains 1 on warp (now 0).
On completion: Damaged (2s), time warp (5s), advance.

Level 4 (8 HP, 2s timer):

8 random poses (repeats allowed from all 4 attacks).
No crystal.
On completion: Shows destroyed pose, victory screen.

UI and Flow

Title Screen: "MECHA HERO" title, "Recursion Jam Edition" subtitle, "Start Game" and "How to Play" buttons.
How to Play Modal: Overlay with rules list, close button (× or overlay click).
Game Screen Layout:

Top-left: 3 heart icons.
Top-right: Pause button; below: "Fight: X/4".
Center-top: Timer bar (with "PAUSED" label).
Center: Enemy container (crystal bar above HP bar above pose image).
Below: Instruction text (bold green, e.g., "RESPOND NOW! HP: X/Y"), message text (e.g., pose desc or feedback).
Below: Attacks grid (2x2, fades in/out; disabled buttons at 30% opacity).
Bottom: Restart button (hidden until end).

Visual Feedback:

Pose transitions: Image swap with fallback SVG text.
Attacks: Fade in on pose show; only relevant buttons enabled.
Bars: Smooth width transitions; HP red, crystal cyan, timer green.

Restart: Resets to Level 1, full hearts/crystal.

Assets

Images folder: pose1.png (neutral), pose2-5.png (attacks), pose7.png (damaged), pose8.png (warp), pose9.png (destroyed), shield/rocket/sword/plasma.png (buttons), heart_full/empty.png.

I've also added a 'pose2-hit' 'pose2-dmg' for each of the attack poses (2-5) with the hit showing if the player picks the incorrect defense, and dmg showing if they picked the correct one. These should be shown for 1 second to provide additional feedback on the players action.
