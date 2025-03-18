import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { KeyboardControls, Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import {
  EffectComposer,
  SMAA,
  Vignette,
  BrightnessContrast,
  HueSaturation,
  DepthOfField,
  Bloom,
  ChromaticAberration
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useAccount } from 'jazz-react';
import { Game, ListOfPlayers } from './schemas/game';
import { Group } from 'jazz-tools';
import { Leva } from 'leva';
import { MobileControlsProvider } from './contexts/MobileControlsContext';
import { MobileControls } from './components/MobileControls';
import { GameScene } from './components/GameScene';
import { useLightingControls } from './hooks/useLightingControls';
import { usePostProcessingControls } from './hooks/usePostProcessingControls';

// Dynamic Depth of Field component to focus on character
function DynamicDepthOfField({ enabled, target, focalLength, bokehScale }) {
  const { camera } = useThree();
  const [focusDistance, setFocusDistance] = useState(0);
  
  useEffect(() => {
    if (!enabled || !target.current) return;
    
    // Update focus distance based on character position
    const updateFocus = () => {
      if (!target.current) return;
      // Calculate distance from camera to character
      const distance = camera.position.distanceTo(target.current.position);
      // Convert world distance to normalized focus distance (0-1 range)
      setFocusDistance(Math.min(distance / 20, 1));
      
      requestAnimationFrame(updateFocus);
    };
    
    const animationId = requestAnimationFrame(updateFocus);
    return () => cancelAnimationFrame(animationId);
  }, [enabled, target, camera]);

  return enabled ? (
    <DepthOfField
      focusDistance={focusDistance}
      focalLength={focalLength}
      bokehScale={bokehScale}
    />
  ) : null;
}

function App() {
  const [gameId, setGameId] = useState(null);
  const { me } = useAccount();
  const lighting = useLightingControls();
  const postProcessing = usePostProcessingControls();
  const characterRef = { current: null };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get("game");
    if (gameIdFromUrl) {
      setGameId(gameIdFromUrl);
    } else {
      // Create new game
      const group = Group.create({ owner: me });
      const playersList = ListOfPlayers.create([], { owner: group });
      const newGame = Game.create(
        {
          players: playersList,
          currentIt: null,
          status: "waiting",
        },
        { owner: group }
      );
      setGameId(newGame.id);
      window.history.pushState({}, "", `?game=${newGame.id}`);
      // TODO: Share invite link: createInviteLink(group, "writer", { valueHint: "game" })
    }
  }, [me]);

  if (!gameId) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen">
      <Leva />
      <MobileControlsProvider>
        <MobileControls />
        <KeyboardControls
          map={[
            { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
            { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
            { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
            { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
            { name: 'jump', keys: ['Space'] },
            { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
          ]}
        >
          <Canvas shadows>
            <color attach="background" args={['#1a1a2e']} />
            <Environment preset="sunset" />
            <ambientLight intensity={lighting.ambientIntensity} />
            <directionalLight
              castShadow
              position={[lighting.directionalDistance, lighting.directionalHeight, lighting.directionalDistance / 2]}
              intensity={lighting.directionalIntensity}
              shadow-mapSize={[4096, 4096]}
              shadow-camera-left={-30}
              shadow-camera-right={30}
              shadow-camera-top={30}
              shadow-camera-bottom={-30}
              shadow-camera-far={50}
              shadow-bias={-0.0001}
              shadow-normalBias={0.02}
            />
            <Physics>
              <GameScene gameId={gameId} />
            </Physics>
            <EffectComposer>
              <DynamicDepthOfField
                enabled={postProcessing.depthOfFieldEnabled}
                target={characterRef}
                focalLength={postProcessing.focalLength}
                bokehScale={postProcessing.bokehScale}
              />
              {postProcessing.bloomEnabled && (
                <Bloom
                  intensity={postProcessing.bloomIntensity}
                />
              )}
              {postProcessing.chromaticAberrationEnabled && (
                <ChromaticAberration
                  offset={[postProcessing.chromaticAberrationOffset, postProcessing.chromaticAberrationOffset]}
                  blendFunction={BlendFunction.NORMAL}
                />
              )}
              {postProcessing.vignetteEnabled && (
                <Vignette
                  darkness={postProcessing.vignetteDarkness}
                  offset={postProcessing.vignetteOffset}
                  blendFunction={BlendFunction.NORMAL}
                />
              )}
              {postProcessing.brightnessContrastEnabled && (
                <BrightnessContrast
                  brightness={postProcessing.brightness}
                  contrast={postProcessing.contrast}
                  blendFunction={BlendFunction.NORMAL}
                />
              )}
              {postProcessing.hueSaturationEnabled && (
                <HueSaturation
                  hue={postProcessing.hue}
                  saturation={postProcessing.saturation}
                  blendFunction={BlendFunction.NORMAL}
                />
              )}
              <SMAA />
            </EffectComposer>
          </Canvas>
        </KeyboardControls>
      </MobileControlsProvider>
    </div>
  );
}

export default App;