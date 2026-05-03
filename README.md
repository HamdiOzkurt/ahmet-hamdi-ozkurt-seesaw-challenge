# Seesaw Simulation

A playground seesaw simulation built with pure HTML, CSS, and JavaScript — no libraries, no canvas.

**Live demo:** *(GitHub Pages link — to be added after deploy)*

---

## How to Run

Just open `index.html` in a browser. No build step, no dependencies.

---

## Thought Process

My first goal was to get the physics right before touching the visuals. I started with `computeTorques()` — iterating over every placed object, separating left (negative offset) from right (positive offset), and calculating `weight × distance` for each side. Once that returned correct numbers, everything else could be derived from it.

For the angle I used the formula from the spec:
```js
Math.max(-30, Math.min(30, (rightTorque - leftTorque) / 10))
```
But I changed the divisor from `/10` to `/50`. With `/10`, dropping a single 5kg object at 150px from center already hits maximum tilt — the seesaw basically just snaps to ±30° every time, which is not very interesting to interact with. `/50` keeps the range meaningful across multiple objects.

After the physics I focused on the animation. My first instinct was `transition: transform` on the plank — but that has a problem: if the target angle changes while the transition is still running (because the user keeps clicking), the animation snaps and restarts from wherever it is. So I wrote a spring simulation instead. It tracks `currentAngle`, `targetAngle`, and `velocity` separately, and on each `requestAnimationFrame`:

```js
velocity += (targetAngle - currentAngle) * stiffness;
velocity *= damping;
currentAngle += velocity;
```

This way the plank naturally accelerates toward the target and decelerates as it arrives, and new clicks mid-animation don't cause snapping — the spring just gets a new target and keeps going.

---

## Design Decisions

**Objects as DOM elements, not canvas**
The spec explicitly bans canvas, which was actually a nice constraint. Each dropped object is a `div` positioned absolutely inside the plank. Since the plank rotates, its children rotate with it — objects stay glued to their positions on the plank for free, without any trigonometry. The distance offset in the DOM already represents the physical distance from the pivot.

**Shape variety**
Each object is randomly a circle or a square. This adds a bit of visual noise that makes the simulation look less repetitive with many objects.

**`clampOffset()`**
Without this, clicking near the edge of the plank would place an object with its center outside the plank boundary. The clamp subtracts half the object's size from the limit so the object always stays fully within the plank visually.

**`nextWeight` preview**
The weight of the next object to be dropped is generated upfront and shown in the info panel. This lets the user make strategic decisions about where to click, which makes the simulation more like a puzzle than pure randomness.

**Activity log**
Each drop is logged with its weight, side, and distance from pivot. New entries appear at the top so the most recent action is always visible without scrolling. Entries animate in with a subtle slide to give feedback that something was added.

**Scale ticks**
The tick marks go from `-(PLANK_WIDTH / 2)` to `+(PLANK_WIDTH / 2)` derived from the constant, not a hardcoded number. This means if the plank width changes, the scale updates automatically.

---

## Trade-offs and Limitations

**Object overlap**
Objects can visually stack on top of each other if placed at the same position. Handling this properly would require tracking each object's bounding box and shifting new objects along the plank to avoid overlap. That adds complexity without changing the physics, so I left it out.

**Spring divisor is not physical**
The `/50` divisor is tuned for user experience, not real-world physics. A real seesaw would use moment of inertia and angular acceleration. The goal here was a satisfying simulation, not a physics engine.

**Activity log not persisted**
The object state is saved to `localStorage` but the activity log is not. It's decorative information for the current session — rebuilding it on page load from the saved state would be straightforward but added no value to the core experience.

**Sound on mobile**
The Web Audio API requires a user gesture before creating an `AudioContext`. The drop sound works correctly on desktop but may be silently ignored on some mobile browsers on the first interaction.

---

## AI Usage

I used Claude (claude.ai) as a coding assistant throughout this project. Specifically:

- Helped debug the `requestAnimationFrame` stop condition in the spring animation (the `animating` flag wasn't being reset correctly when the plank settled)
- Syntax reference for `Web Audio API` — `exponentialRampToValueAtTime` parameters
- Suggested using `prepend()` instead of `appendChild()` to make new log entries appear at the top

The physics model, animation architecture, DOM structure, and overall design decisions were my own. I wrote all the core logic myself and can explain every line.
