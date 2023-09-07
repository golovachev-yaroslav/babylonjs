import {
  MeshBuilder,
  Scene,
  Vector3,
  Texture,
  Mesh,
  StandardMaterial,
  PhysicsImpostor,
} from '@babylonjs/core';

/** Main ground. */
export class Ground extends Mesh {

  public constructor(scene: Scene) {
    super('ground');
    this.create(scene);
  }

  /**
   * Creates ground.
   * @param scene Main scene.
   */
  private create(scene: Scene): Mesh {
    const ground = MeshBuilder.CreateGround('ground', {
      width: 24,
      height: 24,
    });
    const material = new StandardMaterial('groundMaterial');
    const diffTexture = new Texture(
      'src/textures/floor/floor_klinkers_04_diff_1k.jpg',
    );
    const aoTexture = new Texture(
      'src/textures/floor/floor_klinkers_04_ao_1k.jpg',
    );
    const normalTex = new Texture(
      'src/textures/floor/floor_klinkers_04_nor_gl_1k.jpg',
    );
    const specTex = new Texture(
      'src/textures/floor/floor_klinkers_04_spec_1k.jpg',
    );

    material.diffuseTexture = diffTexture;
    material.ambientTexture = aoTexture;
    material.bumpTexture = normalTex;
    material.specularTexture = specTex;

    const uvScale = 10;
    const texturesArray: Texture[] = [
      diffTexture,
      aoTexture,
      normalTex,
      specTex,
    ];

    texturesArray.forEach(texture => {
      texture.uScale = uvScale;
      texture.vScale = uvScale;
    });

    ground.material = material;
    ground.position = Vector3.Zero();
    ground.receiveShadows = true;
    ground.checkCollisions = true;

    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0 },
      scene,
    );

    return ground;
  }
}
