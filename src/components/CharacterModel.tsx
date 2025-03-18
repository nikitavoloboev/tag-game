import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';

type CharacterModelProps = {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  color?: string;
};

export function CharacterModel({ isMoving, isSprinting, isGrounded, color }: CharacterModelProps) {
  const group = useRef<Group>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const { scene, animations } = useGLTF('/models/character.glb', true);
  const { actions } = useAnimations(animations, group);

  scene.traverse((child) => {
    if ('material' in child) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (color && 'color' in child.material) {
        child.material.color.set(color);
      }
    }
  });

  useEffect(() => {
    let targetAnimation = 'IDLE';
    if (!isGrounded) {
      targetAnimation = 'FALL';
    } else if (isMoving) {
      targetAnimation = 'RUN';
    }

    if (!currentAnimation) {
      // Initial animation setup
      const action = actions[targetAnimation];
      if (action) {
        action.reset().play();
        action.timeScale = isMoving && isSprinting ? 1.25 : 1;
        setCurrentAnimation(targetAnimation);
      }
    } else if (currentAnimation !== targetAnimation) {
      // Switch to a new animation only when it changes
      const prevAction = actions[currentAnimation];
      const nextAction = actions[targetAnimation];
      if (prevAction && nextAction) {
        nextAction.reset().play();
        nextAction.timeScale = isMoving && isSprinting ? 1.25 : 1;
        prevAction.crossFadeTo(nextAction, 0.15, true);
        setCurrentAnimation(targetAnimation);
      }
    } else {
      // Same animation, only update timeScale if needed without changing state
      const action = actions[currentAnimation];
      if (action) {
        const newTimeScale = isMoving && isSprinting ? 1.25 : 1;
        if (action.timeScale !== newTimeScale) {
          action.timeScale = newTimeScale;
        }
      }
    }
  }, [actions, isMoving, isSprinting, isGrounded]);
  
  return <primitive ref={group} object={scene} />;
}