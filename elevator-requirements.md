# Elevator System Requirements

## Building Setup
- 10 floors (0 to 9, 0 is ground floor).
- 5 elevators, each using an SVG (`images/elevator.svg`).
- Green "Call" button per floor.

## Calling an Elevator
- On button click:
  - Button: Red, text changes to "Waiting".
  - Send closest available elevator to the floor.
  - Queue requests if all elevators are busy.
  - Smooth movement (CSS transitions).
  - Log time to reach floor.
  - Elevator color: Red during movement.

## Elevator Reaches Floor
- Play sound (e.g., beep).
- Elevator color: Green.
- Button: Blue, text "Arrived", dashed border.
- Wait 2 seconds, then:
  - Elevator color: Black.
  - Button: Green, text "Call".

## Technical
- Framework: Vanilla JavaScript (or jQuery).
- Styling: SCSS, modular design.
- HTML: Predefined, no `createElement`.
- Entry point: `index.js`.

## Design
- **Call Button**: Green (#00FF00), "Call", 2px solid black border, Arial 16px.
- **Waiting Button**: Red (#FF0000), "Waiting".
- **Arrived Button**: Blue (#0000FF), "Arrived", 2px dashed black border, Arial 16px bold.
- **Elevator**: Black (#000000) default, Red moving, Green arrived.

## Notes
- Use placeholder SVG if unavailable.
- Log time in console or UI.