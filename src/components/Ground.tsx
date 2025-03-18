import { RigidBody } from '@react-three/rapier';

export function Ground() {
  const wallHeight = 3;
  const groundSize = 30;
  const wallThickness = 1;

  return (
    <group>
      {/* Ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -1, 0]}>
          <boxGeometry args={[groundSize, 2, groundSize]} />
          <meshStandardMaterial 
            color="#2a2a4a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* North Wall */}
        <mesh position={[0, wallHeight/2, -groundSize/2]} castShadow receiveShadow>
          <boxGeometry args={[groundSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#2a2a4a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        {/* South Wall */}
        <mesh position={[0, wallHeight/2, groundSize/2]} castShadow receiveShadow>
          <boxGeometry args={[groundSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#2a2a4a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        {/* East Wall */}
        <mesh position={[groundSize/2, wallHeight/2, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[groundSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#2a2a4a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        {/* West Wall */}
        <mesh position={[-groundSize/2, wallHeight/2, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[groundSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#2a2a4a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </RigidBody>
    </group>
  );
}