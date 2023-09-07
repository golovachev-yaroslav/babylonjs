# Loading models

By default to load models you have to specify path to model, using `SceneLoader`.

Here as an example:

```ts
import '@babylonjs/loaders'; // this is required to import model

// ..

await SceneLoader.ImportMeshAsync('', '/models/', 'model.glb', this.scene);
```

[Read more](https://doc.babylonjs.com/guidedLearning/usingVite)
