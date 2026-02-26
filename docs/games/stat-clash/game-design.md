# Stat Clash — Game Design

---

## Game Overview

Stat Clash (Higher/Lower) is a comparison guessing game where players see two items and must guess which has a higher value for a specific metric:

```
Left: Apple → 3,900 billion $ market cap
Right: Nvidia → [hidden] billion $ market cap
Question: Which company has a higher market cap?
```

---

## Categories at Launch

| Category | Example Pairs | Image Source | Items Needed | Update Frequency |
|---|---|---|---|---|
| Tech Companies | Apple vs Nvidia market cap | Company logos | 80–120 | Quarterly |
| Football Stars | Messi vs Ronaldo career goals | Player photo/club logo | 100–150 | Yearly/seasonal |
| Countries | India vs China population | Country flags | 100+ | Yearly |

---

## Play Modes

Stat Clash supports four distinct play modes, each with a different social context.

### Mode 1: Solo

A single player plays entirely in the browser. No network, no WebSocket. This is the baseline mode and must work offline.

### Mode 2: Hotseat

Multiple players sit around one device (tablet, laptop, TV + mouse). Players take turns on the same screen. Each player has their own streak; when one player answers, the screen rotates to the next player for the next pair.

```
SharedScreen shows: Current Player name + current pair
Player taps Left or Right
→ Result shown briefly
→ Next player's turn begins
```

**State additions over Solo:**
- `currentPlayerIndex` — whose turn it is
- `players` — ordered list of player names + individual scores
- `roundsPerPlayer` — how many turns each player gets (configurable)
- Game ends when all players have used their `roundsPerPlayer` turns; winner is highest scorer

Players are added before the game starts (lobby screen: "Add players").

### Mode 3: Screen Mode (Jackbox-style)

A shared screen (TV / projector / cast tab) shows the game. Each player joins from their own phone via a room code. The shared screen is a passive display; phones are the controllers.

```
TV Browser (display-only client)
  ↑ receives state broadcasts
  |
Durable Object (room authority)
  ↑ receives GUESS_HIGHER actions
  |
Player Phones (controller clients)
  → each phone shows: Left button | Right button
  → current player's phone is "active", others see "waiting"
```

**How it works:**
1. Host opens the game on a large screen and a room code appears
2. Players scan a QR code or type the room URL on their phones
3. On each round, only the current player's phone shows the active guess buttons; all others show "waiting for [player name]…"
4. After each correct guess, turn rotates to the next player's phone
5. A wrong guess ends that player's streak, but the game continues through all players' turns

### Mode 4: Remote Multiplayer

Players connect from different locations — each person on their own device. No shared screen. The game is played entirely through individual browsers. Suitable for playing with remote friends over Discord, WhatsApp, or any call.

**How it differs from Screen Mode:**
- No separate "display" client role — every participant is a player
- Each player sees the full game board on their own screen
- Turn indicator shows whose turn it is ("Your turn!" vs "Waiting for Ahmed...")

Room creation generates a shareable link — players paste it anywhere.

**Note on Discord:** No Discord bot or OAuth is needed. The shareable link is enough. This is intentionally low-friction — it works with any communication tool.

---

## Mode Summary

| Mode | Screen Setup | Players | Turn Control |
|---|---|---|---|
| **Solo** | 1 device | 1 | n/a |
| **Hotseat** | 1 device, pass around | 2–8 | Tap to pass |
| **Screen Mode** | TV + phones | 2–8 | Phone controller |
| **Remote** | Each own device | 2–8 | Turn-based |

---

## Core Mechanics

### Round Structure

Each round shows two items from the same category and metric type. The player must guess which value is higher. The correct answer is then revealed.

### Pair Rules

- Both items in a pair always compare the **same metric type** (goals vs goals, never goals vs assists)
- An entity is never repeated in the same session
- Left/right position is randomised so the correct answer isn't always on one side

### Streak System

- Correct answer → streak continues, next pair shown
- Wrong answer → streak ends
- In solo mode: game over on wrong answer
- In multiplayer modes: wrong answer ends that player's streak; game continues to next player's turn

### Difficulty

Difficulty is chosen at session start and controls the entry point. It is **not a fixed ceiling** — the game gets harder as the streak grows regardless of the setting chosen.

| Streak | Effect |
|---|---|
| 0–4 | Selected difficulty |
| 5–9 | One level harder |
| 10+ | Always hard |

Difficulty is based on **percentage difference** between the two values:

```
percentDiff = |a.value - b.value| / max(a.value, b.value)
```

This works uniformly across different scales — goals (0–800), market caps (billions), populations (millions to billions).

Each category has its own thresholds because values cluster differently:

| Category | Easy threshold | Medium threshold |
|---|---|---|
| Football | ≥ 40% diff | ≥ 15% diff |
| Companies | ≥ 60% diff | ≥ 25% diff |
| Countries | ≥ 70% diff | ≥ 30% diff |
| Mixed / default | ≥ 50% diff | ≥ 20% diff |

Hard = below the medium threshold.

### Pool Exhaustion

The game fetches ~80 items at session start. If the player exhausts all valid pairs (exceptional at ~30 rounds max), the game ends with a "You beat the category!" screen. This is a design choice: exhausting the pool is an achievement, not an error.

### Scoring

Each correct guess earns points. Score increases with streak length and (optionally) with how quickly the player answers.

---

## Data Requirements

| Category | Metric Types | Pending | Approved | Target |
|---|---|---|---|---|
| Tech Companies | market-cap, revenue, employees | 120 | 0 | 100 |
| Football Players | goals, assists, appearances | 450 | 0 | 150 |
| Football Teams | position, wins, goals-scored | 200 | 0 | 100 |
| Countries | population, area, gdp | 400 | 0 | 100 |

**Action required before launch:** bulk-approve items via admin panel.

---

## Open Questions for Playtesting

1. Does `football: { easy: 0.40, medium: 0.15 }` feel right? Or do easy pairs feel too obvious?
2. Does difficulty progression at streak=5 and streak=10 feel natural, or too sudden?
3. Should "hard" mode start hard and stay hard, or still progress?

These are tuning questions only. The thresholds live in one file and can be adjusted without touching any other code.