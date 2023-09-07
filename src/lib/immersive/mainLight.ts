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
   * @param sphere Sphere mesh.
   * @param box Box mesh.
   * @param car Car mesh.
   */
  public static create(scene: Scene, sphere: Mesh, box: Mesh, car: Mesh) {
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

    // sphere.receiveShadows = true;
    // shadowGenerator.addShadowCaster(sphere);

    // box.receiveShadows = true;
    // shadowGenerator.addShadowCaster(box);

    car.receiveShadows = true;
    shadowGenerator.addShadowCaster(car);
  }
}
