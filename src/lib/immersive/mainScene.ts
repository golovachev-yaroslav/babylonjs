import {
  Engine,
  Scene,
  Vector3,
  Mesh,
  ActionManager,
  IncrementValueAction,
  PredicateCondition,
  IPointerEvent,
  PickingInfo,
  PhysicsImpostor,
  Sound,
  Space,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Inspector } from "@babylonjs/inspector";

import { Box } from "../mesh/Box";
import { Sphere } from "../mesh/Sphere";
import { Ground } from "../mesh/Ground";
import { Car, CarMesh } from "../mesh/Car";

import { Environment } from "./environment";
import { MainCamera } from "./mainCamera";
import { MainLight } from "./mainLight";

/** Main scene of the app. */
export class MainScene {
  private readonly engine: Engine;

  private scene: Scene;

  private readonly bumpSound: Sound;

  private readonly fallSound: Sound;

  private ground: Mesh;

  private spheres: Mesh[] = [];

  private boxes: Mesh[] = [];

  private car?: Car;

  private isGameOver: boolean;

  public constructor(canvas: HTMLCanvasElement) {
    this.isGameOver = false;
    this.engine = new Engine(canvas);
    this.scene = new Scene(this.engine);

    Environment.create(this.scene);
    MainCamera.create(this.scene);

    // Inspector.Show(this.scene, {});

    this.engine.displayLoadingUI();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    this.bumpSound = new Sound("bump", "src/sounds/bump.wav", this.scene);
    this.fallSound = new Sound(
      "fall",
      "src/sounds/short-whistle-fall.wav",
      this.scene
    );

    this.ground = new Ground(this.scene);
    this.boxes.push(
      new Box().create(this.generateMeshName(), this.scene, {
        position: this.generateRandomPosition(),
      })
    );
    this.spheres.push(
      new Sphere().create(this.generateMeshName(), this.scene, {
        position: this.generateRandomPosition(),
      })
    );
    this.loadCar().then();
  }

  /** Create random range of values. */
  private getRandomRange(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
  }

  /** Create scene. */
  private generateRandomPosition(): Vector3 {
    const x = this.getRandomRange(-10, 10);
    const z = this.getRandomRange(-10, 10);

    return new Vector3(x, 1, z);
  }

  /** Generate mesh name. */
  private generateMeshName(): string {
    return (Math.random() + 1).toString(36).substring(7);
  }

  /** Reload game. */
  private reload(): void {
    this.isGameOver = false;
    this.boxes.forEach((box) => box.dispose());
    this.spheres.forEach((sphere) => sphere.dispose());
    this.addBox();
    this.addSphere();
    this.loadCar().then();
  }

  /** Load car mesh. */
  private async loadCar(): Promise<Car> {
    const car = new Car(this.scene);
    const meshes = await car.create("car");

    MainLight.create(this.scene, meshes.car)
    this.boxes.forEach((box) => MainLight.create(this.scene, box));
    this.spheres.forEach((sphere) => MainLight.create(this.scene, sphere));

    this.createActions({ ...meshes });
    this.car = car;

    // Move the box and sphere on car hit.
    
    this.boxes.forEach((box) => this.moveMeshOnHit(box, PhysicsImpostor.BoxImpostor, meshes.car));
    this.spheres.forEach((sphere) => this.moveMeshOnHit(sphere, PhysicsImpostor.SphereImpostor, meshes.car));

    this.engine.hideLoadingUI();

    return car;
  }

  /** Erase 3D related resources. */
  public erase(): void {
    this.scene.dispose();
    this.engine.dispose();
  }

  /** Add sphere. */
  public addSphere(): Mesh[] {
    if (this.car?.mesh?.car) {
      const sphere = new Sphere().create(this.generateMeshName(), this.scene, {
        position: this.generateRandomPosition(),
      });
      this.moveMeshOnHit(sphere, PhysicsImpostor.SphereImpostor, this.car.mesh.car)
  
      this.spheres.push(sphere);
    }

    return this.spheres;
  }

  /** Remove sphere. */
  public removeSphere(): Mesh[] {
    const sphere = this.spheres.pop();
    
    sphere?.dispose();

    return this.spheres;
  }

  /** Add box. */
  public addBox(): Mesh[] {
    if (this.car?.mesh?.car) {
      const box = new Box().create(this.generateMeshName(), this.scene, {
        position: this.generateRandomPosition(),
      });
      this.moveMeshOnHit(box, PhysicsImpostor.BoxImpostor, this.car.mesh.car)
  
      this.boxes.push(box);
    }

    return this.boxes;
  }

  /** Remove box. */
  public removeBox(): Mesh[] {
    const box = this.boxes.pop();
    
    box?.dispose();

    return this.boxes;
  }

  /**
   * Move mesh on car hit.
   * @param mesh Target mesh.
   * @param boxImpostorType Box impostor type.
   * @param car Car mesh.
   */
  private moveMeshOnHit(mesh: Mesh, boxImpostorType: number, car: Mesh): void {
    car.actionManager?.registerAction(
      new IncrementValueAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: mesh,
        },
        mesh,
        "position.z",
        -0.1,
        new PredicateCondition(mesh as any, () => {
          car.physicsImpostor = new PhysicsImpostor(
            mesh,
            boxImpostorType,
            { mass: 1, restitution: 0 },
            this.scene
          );

          this.bumpSound.play();

          return true;
        })
      )
    );
  }

  /** Check game over. */
  private checkGameOver(): void {
    const dropPosition = -5;

    if (
      this.car?.mesh?.car.position &&
      this.car?.mesh?.car.position.y < dropPosition
    ) {
      this.isGameOver = true;
    }

    if (this.boxes.length === 0 && this.spheres.length === 0) {
      this.isGameOver = true;
    }
  }

  /** Create actions. */
  private createActions({ car }: CarMesh): void {
    let distVec = 0;
    let targetNormalized: Vector3 = Vector3.Zero();
    let speed = 0.2;

    // Click on the scene
    this.scene.onPointerDown = (
      event: IPointerEvent,
      pickResult: PickingInfo
    ) => {
      // Left button on the ground
      if (
        event.button === 0 &&
        pickResult.pickedMesh?.id === this.ground.name
      ) {
        //@ts-ignore
        car.speed = new Vector3(0, 0, 0.08);
        //@ts-ignore
        car.nextspeed = Vector3.Zero();
        this.car?.startRotateWheels();
        let targetCoords = pickResult.pickedPoint;

        if (targetCoords) {
          const initCoords = car.position;

          distVec = Vector3.Distance(targetCoords, initCoords);
          targetCoords = targetCoords.subtract(initCoords);
          targetNormalized = Vector3.Normalize(targetCoords);

          // Turn the car to target click.
          car.setDirection(new Vector3(-targetCoords.x, 0, -targetCoords.z));
        }
      }
    };

    const carPhysics = () => {
      this.checkGameOver();
      if (distVec > 0.1) {
        let carMoveVector = car.forward;
        carMoveVector.y = 0;
        carMoveVector.x = -carMoveVector.x * speed;
        carMoveVector.z = -carMoveVector.z * speed;

        distVec -= 0.1;
        // car.translate(targetNormalized, 0.1, Space.WORLD);
        car.physicsImpostor?.setLinearVelocity(
          new Vector3(0, -Environment.gravity, 0)
        );
        //@ts-ignore
        car.speed = Vector3.Lerp(carMoveVector, car.nextspeed, 0.3);
        //@ts-ignore
        car.moveWithCollisions(car.speed);
      }

      if (distVec <= 0.1) {
        this.car?.stopRotateWheels();
      }

      if (this.isGameOver) {
        this.fallSound.play();
        this.scene.unregisterBeforeRender(carPhysics);
        this.reload();
      }
    };

    this.scene.registerBeforeRender(carPhysics);
  }
}
