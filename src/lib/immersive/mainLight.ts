import {
  Color3,
  DirectionalLight,
  Scene,
  Vector3,
  ShadowGenerator,
  Mesh,
} from '@babylonjs/core';

/** Main light of the scene. */
export class MainLight {
  /**
   * Creates main source of light for scene.
   * @param scene Main scene.
   * @param mesh Mesh.
   */
  public static create(scene: Scene, mesh: Mesh) {
    const directionalLight = new DirectionalLight(
      'mainLight',
      new Vector3(-1, -1, -1),
      scene,
    );

    directionalLight.intensity = 2;
    directionalLight.specular = Color3.White();
    directionalLight.shadowEnabled = true;
    directionalLight.shadowMinZ = 1;
    directionalLight.shadowMaxZ = 10;

    const shadowGenerator = new ShadowGenerator(2048, directionalLight);

    mesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(mesh);
  }
}
