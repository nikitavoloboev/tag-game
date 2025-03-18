import { useEffect, useRef, useState } from 'react';
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
    // Specify loading depth to fetch players fully
    const game = useCoState(Game, gameId, { players: [{}] });
    const { me } = useAccount();
    const characterRef = useRef(null);
    const [playersLoaded, setPlayersLoaded] = useState(false);

    // Wait until game and all players are loaded
    useEffect(() => {
        if (game && game.players && game.players.every(p => p)) {
            setPlayersLoaded(true);
        } else {
            setPlayersLoaded(false);
        }
    }, [game]);

    // Safely find my player and filter others - only after loading is complete
    const myPlayer = playersLoaded ? game.players.find(p => p && p._owner === me) : null;
    const otherPlayers = playersLoaded ? game.players.filter(p => p && p._owner !== me) : [];

    // Create local player if not exists
    useEffect(() => {
        if (playersLoaded && !myPlayer && game.players) {
            try {
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
            } catch (error) {
                console.error("Error creating player:", error);
            }
        }
    }, [game, myPlayer, me, playersLoaded]);

    // Update position and handle tagging
    useFrame(() => {
        if (!playersLoaded || !characterRef.current || !myPlayer) return;

        try {
            const position = characterRef.current.translation();
            myPlayer.positionX = position.x;
            myPlayer.positionY = position.y;
            myPlayer.positionZ = position.z;

            // Tag logic: only "it" player checks for tags
            if (game && myPlayer.id === game.currentIt?.id) {
                const myPosition = [position.x, position.y, position.z];
                for (const otherPlayer of otherPlayers) {
                    if (!otherPlayer) continue; // Skip null players
                    
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
        } catch (error) {
            console.error("Error in game loop:", error);
        }
    });

    // Show loading placeholder until everything is ready
    if (!playersLoaded) {
        return (
            <group>
                <mesh position={[0, 1, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="gray" />
                </mesh>
            </group>
        );
    }

    return (
        <>
            {myPlayer && <CharacterController ref={characterRef} />}
            {otherPlayers.map(player => (
                <RemotePlayer
                    key={player.id}
                    player={player}
                    isIt={player.id === game?.currentIt?.id}
                />
            ))}
            <Building />
            <Balls />
            <FollowCamera target={characterRef} />
        </>
    );
}