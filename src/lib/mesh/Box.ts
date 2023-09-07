import {
  MeshBuilder,
  Scene,
  Mesh,
  Vector3,
  Texture,
  StandardMaterial,
} from '@babylonjs/core';

interface Options {
  /** Position. */
  position: Vector3;
}

/** Box. */
export class Box {

  /**
   * Creates box.
   * @param name Sphere name.
   * @param scene Main scene.
   * @param options Options.
   */
  public create(name: string, scene: Scene, options?: Options): Mesh {
    const box = MeshBuilder.CreateBox(
      name,
      { width: 2, height: 2, depth: 2 },
      scene,
    );
    const material = new StandardMaterial('boxMaterial');
    const diffTexture = new Texture(
      'src/textures/box/rusty_metal_02_diff_1k.jpg',
    );
    const aoTexture = new Texture('src/textures/box/rusty_metal_02_ao_1k.jpg');
    const normalTex = new Texture(
      'src/textures/box/rusty_metal_02_nor_gl_1k.jpg',
    );
    const specTex = new Texture('src/textures/box/rusty_metal_02_spec_1k.jpg');

    material.diffuseTexture = diffTexture;
    material.ambientTexture = aoTexture;
    material.bumpTexture = normalTex;
    material.specularTexture = specTex;

    box.position = new Vector3(4, 1, -2);

    if (options?.position) {
      box.position = options?.position;
    }

    box.material = material;
    box.checkCollisions = true;

    return box;
  }
}
