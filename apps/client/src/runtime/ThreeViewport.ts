import * as THREE from 'three';

export class ThreeViewport {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  private readonly previewMesh: THREE.Mesh;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene.background = new THREE.Color(0x0f172a);
    this.camera.position.set(4.5, 3.5, 6.5);
    this.camera.lookAt(0, 0.5, 0);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 2.2);
    this.scene.add(hemisphereLight);

    const grid = new THREE.GridHelper(12, 24, 0x64748b, 0x334155);
    this.scene.add(grid);

    this.previewMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.72 }),
    );
    this.previewMesh.position.y = 0.5;
    this.scene.add(this.previewMesh);

    this.resize();
  }

  public start(): void {
    this.renderer.setAnimationLoop(() => {
      this.previewMesh.rotation.y += 0.003;
      this.renderer.render(this.scene, this.camera);
    });
  }

  public resize(): void {
    const width = Math.max(this.canvas.clientWidth, 1);
    const height = Math.max(this.canvas.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.previewMesh.geometry.dispose();

    const material = this.previewMesh.material;
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
    } else {
      material.dispose();
    }

    this.renderer.dispose();
  }
}
