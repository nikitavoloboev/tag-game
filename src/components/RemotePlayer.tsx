import { useCoState } from 'jazz-react';
import { Player } from '../schemas/game';
import { CharacterModel } from './CharacterModel';

export function RemotePlayer({ player, isIt }) {
    const playerState = useCoState(Player, player.id);
    if (!playerState) return null;

    const position = [
        playerState.positionX,
        playerState.positionY,
        playerState.positionZ,
    ];
    
    return (
        <group position={position}>
            <CharacterModel
                isMoving={false} // Simplified; could compute based on velocity
                isSprinting={false}
                isGrounded={true} // Assume grounded for remote players
                color={isIt ? "#ff0000" : playerState.color} // Red for "it" player
            />
        </group>
    );
}