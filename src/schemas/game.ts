import { CoMap, co, CoList } from 'jazz-tools';

export class Player extends CoMap {
    positionX = co.number; // X-coordinate of player's position
    positionY = co.number; // Y-coordinate
    positionZ = co.number; // Z-coordinate
    velocityX = co.number; // X-component of velocity
    velocityY = co.number; // Y-component
    velocityZ = co.number; // Z-component
    name = co.string;      // Player's display name
    color = co.string;     // Player's color (e.g., hex code for visualization)
}

export class ListOfPlayers extends CoList.Of(co.ref(Player)) {}

export class Game extends CoMap {
    players = co.ref(ListOfPlayers); // Reference to the list of players
    currentIt = co.ref(Player);      // Reference to the player who is currently "it"
    status = co.literal("waiting", "playing", "ended"); // Game state
}