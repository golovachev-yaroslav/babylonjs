import {
  MeshBuilder,
  Scene,
  Vector3,
  Texture,
  Mesh,
  StandardMaterial,
} from '@babylonjs/core';

interface Options {
  /** Position. */
  position: Vector3;
}

/** Sphere. */
export class Sphere {

  /**
   * Creates sphere.
   * @param name Sphere name.
   * @param scene Main scene.
   * @param options Options.
   */
  public create(name: string, scene: Scene, options?: Options): Mesh {
    const sphere = MeshBuilder.CreateSphere(name, { diameter: 1.5 }, scene);
    const material = new StandardMaterial('sphereMaterial');
    const diffTexture = new Texture(
      'src/textures/sphere/metal_plate_diff_1k.jpg',
    );
    const aoTexture = new Texture('src/textures/sphere/metal_plate_ao_1k.jpg');
    const normalTex = new Texture(
      'src/textures/sphere/metal_plate_nor_gl_1k.jpg',
    );
    const specTex = new Texture('src/textures/sphere/metal_plate_spec_1k.jpg');

    material.diffuseTexture = diffTexture;
    material.ambientTexture = aoTexture;
    material.bumpTexture = normalTex;
    material.specularTexture = specTex;

    sphere.position = new Vector3(-5, 1, 1);

    if (options?.position) {
      sphere.position = options?.position;
    }

    sphere.material = material;
    sphere.checkCollisions = true;

    return sphere;
  }
}
