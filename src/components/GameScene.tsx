import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCoState, useAccount } from 'jazz-react';
import { Game, Player } from '../schemas/game';
import { CharacterController } from './CharacterController';
import { Building } from './Building';
import { Balls } from './Balls';
import { FollowCamera } from './FollowCamera';
import { RemotePlayer } from './RemotePlayer';

const TAG_DISTANCE = 1.0;

export function GameScene({ gameId }) {
    const game = useCoState(Game, gameId);
    const { me } = useAccount();
    const characterRef = useRef(null);
    
    // Find my player and other players
    const myPlayer = game?.players?.find(p => p._owner === me);
    const otherPlayers = game?.players?.filter(p => p._owner !== me);

    // Create local player if not exists
    useEffect(() => {
        if (!myPlayer && game?.players) {
            const newPlayer = Player.create(
                {
                    positionX: 0,
                    positionY: 6,
                    positionZ: 1,
                    velocityX: 0,
                    velocityY: 0,
                    velocityZ: 0,
                    name: "Player", // TODO: Allow name input
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                },
                { owner: me }
            );
            game.players.push(newPlayer);
            
            // Start game if first player and enough players
            if (game.players.length > 0 && me.canAdmin(game)) {
                game.status = "playing";
                game.currentIt = newPlayer;
            }
        }
    }, [game, myPlayer, me]);

    // Update position and handle tagging
    useFrame(() => {
        if (characterRef.current && myPlayer) {
            const position = characterRef.current.translation();
            myPlayer.positionX = position.x;
            myPlayer.positionY = position.y;
            myPlayer.positionZ = position.z;

            // Tag logic: only "it" player checks for tags
            if (game && myPlayer.id === game.currentIt?.id) {
                const myPosition = [position.x, position.y, position.z];
                for (const otherPlayer of otherPlayers || []) {
                    const otherPosition = [
                        otherPlayer.positionX,
                        otherPlayer.positionY,
                        otherPlayer.positionZ,
                    ];
                    const distance = Math.sqrt(
                        (myPosition[0] - otherPosition[0]) ** 2 +
                        (myPosition[1] - otherPosition[1]) ** 2 +
                        (myPosition[2] - otherPosition[2]) ** 2
                    );
                    if (distance < TAG_DISTANCE) {
                        game.currentIt = otherPlayer;
                        break;
                    }
                }
            }
        }
    });

    return (
        <>
            {myPlayer && <CharacterController ref={characterRef} />}
            {otherPlayers?.map(player => (
                <RemotePlayer key={player.id} player={player} isIt={player.id === game?.currentIt?.id} />
            ))}
            <Building />
            <Balls />
            <FollowCamera target={characterRef} />
        </>
    );
}