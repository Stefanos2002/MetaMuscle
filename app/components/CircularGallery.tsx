//line 287 vec4 changing img plain background
//line 402 changing img width/height
//line 143 changing text width/height
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  RenderTarget,
} from "ogl";
import { useEffect, useRef } from "react";

type GL = Renderer["gl"];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = "bold 30px Montserrat",
  color: string = "black"
  // fontWeight: string | number = "bold" // NEW param
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  // --- Fixed font and color ---
  context.font = font;
  const fontSize = getFontSize(font);
  // context.font = `${fontWeight} ${fontSize}px ${font}`;
  context.fillStyle = color;

  // --- Word wrapping (centered) ---
  // const words = text.split(" ");
  // const lines: string[] = [];
  // let currentLine = words[0];

  // for (let i = 1; i < words.length; i++) {
  //   const testLine = currentLine + " " + words[i];
  //   const testWidth = context.measureText(testLine).width;
  //   if (testWidth > fixedWidth) {
  //     lines.push(currentLine);
  //     currentLine = words[i];
  //   } else {
  //     currentLine = testLine;
  //   }
  // }
  // lines.push(currentLine);
  let fixedWidth = 630; // start width
  let lines: string[] = [];

  const measureLines = (width: number) => {
    const w = text.split(" ");
    const l: string[] = [];
    let cl = w[0];
    for (let i = 1; i < w.length; i++) {
      const tl = cl + " " + w[i];
      const tw = context.measureText(tl).width;
      if (tw > width) {
        l.push(cl);
        cl = w[i];
      } else {
        cl = tl;
      }
    }
    l.push(cl);
    return l;
  };

  // 🔧 Find a width that keeps text ≤ 3 lines
  do {
    lines = measureLines(fixedWidth);
    if (lines.length > 3) fixedWidth += 50; // widen text area
    else break;
  } while (fixedWidth < 1200);

  const lineHeight = fontSize * 1.8;
  const textHeight = lineHeight * lines.length;

  // --- Fixed width canvas, auto height ---
  canvas.width = fixedWidth;
  canvas.height = Math.ceil(textHeight + 20);

  context.font = font;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.clearRect(0, 0, canvas.width, canvas.height);

  // --- Draw centered lines ---
  const centerX = canvas.width / 2;
  const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => {
    context.fillText(line, centerX, startY + i * lineHeight);
  });

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
  textWidth?: number;
  fontWeight?: number;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  textWidth?: number;
  fontWeight?: number;
  font: string;
  mesh!: Mesh;

  constructor({
    gl,
    plane,
    renderer,
    text,
    textColor = "#545050",
    font = "30px monospace",
  }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(
      this.gl,
      this.text,
      this.font,
      this.textColor
    );
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });

    const aspect = width / height;

    // Text should roughly match the image width (90% of plane width)
    const textWidthScaled = this.plane.scale.x * 1;
    const textHeightScaled = textWidthScaled / aspect;

    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y =
      -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
}

// export class QuickView {
//   gl: GL;
//   parent: Mesh;
//   renderer: Renderer;
//   blurMesh!: Mesh;
//   textMesh!: Mesh;
//   renderTarget!: RenderTarget;

//   constructor(gl: GL, parent: Mesh, renderer: Renderer) {
//     this.gl = gl;
//     this.parent = parent;
//     this.renderer = renderer;

//     this.createBlurEffect();
//     this.createText();
//   }

//   /** --- 1. Create blur background --- */
//   createBlurEffect() {
//     // RenderTarget to capture the gallery background
//     this.renderTarget = new RenderTarget(this.gl, {
//       width: this.gl.canvas.width,
//       height: this.gl.canvas.height,
//     });

//     // Fullscreen quad to apply blur
//     const geometry = new Plane(this.gl, { width: 2, height: 2 });

//     const blurFragment = /* glsl */ `
//       precision highp float;
//       uniform sampler2D tScene;
//       uniform vec2 uResolution;
//       uniform float uAlpha;
//       varying vec2 vUv;

//       vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
//         vec4 color = vec4(0.0);
//         vec2 off1 = direction * 1.411764705882353 / resolution;
//         vec2 off2 = direction * 3.2941176470588234 / resolution;
//         vec2 off3 = direction * 5.176470588235294 / resolution;
//         color += texture2D(image, uv) * 0.1964825501511404;
//         color += texture2D(image, uv + off1) * 0.2969069646728344;
//         color += texture2D(image, uv - off1) * 0.2969069646728344;
//         color += texture2D(image, uv + off2) * 0.09447039785044732;
//         color += texture2D(image, uv - off2) * 0.09447039785044732;
//         color += texture2D(image, uv + off3) * 0.010381362401148057;
//         color += texture2D(image, uv - off3) * 0.010381362401148057;
//         return color;
//       }

//       void main() {
//         vec2 dir1 = vec2(1.0, 0.0);
//         vec2 dir2 = vec2(0.0, 1.0);
//         vec4 blurred = 0.5 * (
//           blur13(tScene, vUv, uResolution, dir1) +
//           blur13(tScene, vUv, uResolution, dir2)
//         );
//         blurred.a *= uAlpha;
//         gl_FragColor = blurred;
//       }
//     `;

//     const program = new Program(this.gl, {
//       vertex: /* glsl */ `
//         attribute vec3 position;
//         attribute vec2 uv;
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           gl_Position = vec4(position, 1.0);
//         }
//       `,
//       fragment: blurFragment,
//       uniforms: {
//         tScene: { value: this.renderTarget.texture },
//         uResolution: { value: [this.gl.canvas.width, this.gl.canvas.height] },
//         uAlpha: { value: 0.0 },
//       },
//       transparent: true,
//       depthTest: false,
//     });

//     this.blurMesh = new Mesh(this.gl, { geometry, program });
//     this.blurMesh.setParent(this.parent);
//   }

//   /** --- 2. Create text overlay --- */
//   createText() {
//     const { texture, width, height } = createTextTexture(
//       this.gl,
//       "View",
//       "bold 60px Montserrat",
//       "#fff"
//     );

//     const geometry = new Plane(this.gl, {
//       width: 1,
//       height: height / width,
//     });

//     const program = new Program(this.gl, {
//       vertex: /* glsl */ `
//         attribute vec3 position;
//         attribute vec2 uv;
//         uniform mat4 modelViewMatrix;
//         uniform mat4 projectionMatrix;
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragment: /* glsl */ `
//         precision highp float;
//         uniform sampler2D tMap;
//         uniform float uAlpha;
//         varying vec2 vUv;
//         void main() {
//           vec4 color = texture2D(tMap, vUv);
//           color.a *= uAlpha;
//           if (color.a < 0.01) discard;
//           gl_FragColor = color;
//         }
//       `,
//       uniforms: { tMap: { value: texture }, uAlpha: { value: 0.0 } },
//       transparent: true,
//       depthTest: false,
//     });

//     this.textMesh = new Mesh(this.gl, { geometry, program });
//     this.textMesh.position.y = 0;
//     this.textMesh.position.z = 0.02;
//     this.textMesh.setParent(this.parent);
//   }

//   /** --- 3. Update alpha (fade in/out on hover) --- */
//   show(show: boolean) {
//     const targetAlpha = show ? 1.0 : 0.0;

//     this.blurMesh.program.uniforms.uAlpha.value = lerp(
//       this.blurMesh.program.uniforms.uAlpha.value,
//       targetAlpha,
//       0.1
//     );

//     this.textMesh.program.uniforms.uAlpha.value = lerp(
//       this.textMesh.program.uniforms.uAlpha.value,
//       targetAlpha,
//       0.1
//     );
//   }

//   /** --- 4. Render pass (called from main render loop) --- */
//   render(scene: Mesh) {
//     // Render the current gallery image or parent to texture
//     this.renderer.render({ scene, target: this.renderTarget });
//     // Then render the blur + text normally
//     this.renderer.render({ scene: this.parent });
//   }
// }

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;
  isHovered: boolean = false;
  baseScaleX!: number;
  baseScaleY!: number;
  // quickView!: QuickView;
  // createQuickView() {
  //   this.quickView = new QuickView(this.gl, this.plane, this.renderer);
  // }

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
    // this.createQuickView();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
             vec4 color = texture2D(tMap, uv);

    // Add a white background behind the image
    vec3 bgColor = vec3(0.9); // white
    vec3 finalColor = mix(bgColor, color.rgb, color.a);

    float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
    float edgeSmooth = 0.002;
    float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

    gl_FragColor = vec4(finalColor, alpha);

        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      texture.needsUpdate = true;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
      // fontWeight: 800,
      // textWidth: 400,
    });
  }

  update(
    scroll: { current: number; last: number },
    direction: "right" | "left"
  ) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({
    screen,
    viewport,
  }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [
          this.viewport.width,
          this.viewport.height,
        ];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y =
      (this.viewport.height * (300 * this.scale)) / this.screen.height;
    this.plane.scale.x =
      (this.viewport.width * (300 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
    this.padding = 3;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

class App {
  mouse = { x: 0, y: 0 };
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: { image: string; text: string }[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;

  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;

  isDown: boolean = false;
  start: number = 0;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "bold 50px Montserrat",
      scrollSpeed = 2,
      scrollEase = 0.05,
    }: AppConfig
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias(
    items: { image: string; text: string }[] | undefined,
    bend: number = 1,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const defaultItems = [
      {
        image: `/images/products/proteins/goldstandard.webp`,
        text: "100% Whey Gold Standard - Optimum Nutrition",
      },
      {
        image: `/images/products/proteins/goldtouch.png`,
        text: "GoldTouch Premium ISO TOUCH 86% ",
      },
      {
        image: `/images/products/proteins/isohydrolized.webp`,
        text: "Iso 100 Hydrolyzed - Dymatize",
      },
      {
        image: `/images/products/plant-based/bioraw.png`,
        text: "BIO Raw 100% Organic Hemp Protein - Chemp",
      },
      {
        image: `/images/products/plant-based/100%_vegan.png`,
        text: "100% Vegan Protein - Scitec Nutrition",
      },
      {
        image: `/images/products/plant-based/plantprotein.png`,
        text: "Plant Protein - PER4M Nutrition",
      },
      {
        image: `/images/products/mass-gainers/metamorphosis.png`,
        text: "Metamorphosis All in 1 Protein Formula - GoldTouch - Nutrition",
      },
      {
        image: `/images/products/mass-gainers/gamechangermass.png`,
        text: "Game Changer Mass - DY Nutrition",
      },
      {
        image: `/images/products/mass-gainers/hypermass.png`,
        text: "Hyper Mass - Biotech USA",
      },
      {
        image: `/images/products/pre-workout/pre-jnx.png`,
        text: "The Curse! Pre-Workout - JNX Sports",
      },
      {
        image: `/images/products/pre-workout/pre-goldstandard.png`,
        text: "Gold Standard Pre-Workout - Optimum Nutrition",
      },
      {
        image: `/images/products/pre-workout/pre-citrulline.png`,
        text: "Citrulline Malate - Biotech USA",
      },
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta =
      wheelEvent.deltaY ||
      (wheelEvent as any).wheelDelta ||
      (wheelEvent as any).detail;
    this.scroll.target +=
      (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  getWorldPosition(mesh: Mesh): [number, number, number] {
    const worldMatrix = mesh.worldMatrix; // mat4
    // position is in the last column of the 4x4 matrix
    return [worldMatrix[12], worldMatrix[13], worldMatrix[14]];
  }

  // checkHover() {
  //   let hovered = false;
  //   this.medias.forEach((media) => {
  //     const plane = media.plane;

  //     // Convert plane position to screen space
  //     const [wx, wy] = this.getWorldPosition(plane); // ignore z if you like
  //     // project to screen space
  //     const vector = { x: wx, y: wy };
  //     // const ndcX = (vector.x / this.viewport.width) * 2 - 1;
  //     // const ndcY = -(vector.y / this.viewport.height) * 2 + 1;
  //     const sx = ((vector.x + 1) / 2) * window.innerWidth;
  //     const sy = ((-vector.y + 1) / 2) * window.innerHeight;

  //     const width =
  //       (plane.scale.x * this.renderer.gl.canvas.width) / this.viewport.width;
  //     const height =
  //       (plane.scale.y * this.renderer.gl.canvas.height) / this.viewport.height;

  //     if (
  //       this.mouse.x * window.innerWidth > sx - width / 2 &&
  //       this.mouse.x * window.innerWidth < sx + width / 2 &&
  //       this.mouse.y * window.innerHeight > sy - height / 2 &&
  //       this.mouse.y * window.innerHeight < sy + height / 2
  //     ) {
  //       // Hovering
  //       plane.scale.set(
  //         media.plane.scale.x * 1.1,
  //         media.plane.scale.y * 1.1,
  //         1
  //       );
  //       hovered = true;
  //     } else {
  //       // Reset
  //       plane.scale.set(media.plane.scale.x, media.plane.scale.y, 1);
  //     }
  //   });

  //   // Change cursor
  //   this.container.style.cursor = hovered ? "pointer" : "grab";
  // }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach((media) => {
        media.onResize({ screen: this.screen, viewport: this.viewport });

        // store the original scale for hover lerp
        media.baseScaleX = media.plane.scale.x;
        media.baseScaleY = media.plane.scale.y;
      });
    }
  }

  update() {
    // Step 2: hover detection
    let hovering = false;

    if (this.medias) {
      const canvasRect = this.renderer.gl.canvas.getBoundingClientRect();
      const canvasW = canvasRect.width;
      const canvasH = canvasRect.height;

      this.medias.forEach((media) => {
        const m = media.plane.worldMatrix;
        const hx = 0.5;
        const hy = 0.5;

        // Define all 4 local corners of the plane
        const corners = [
          [-hx, -hy],
          [hx, -hy],
          [hx, hy],
          [-hx, hy],
        ];

        const screenXs: number[] = [];
        const screenYs: number[] = [];

        // Convert each corner to screen space
        corners.forEach(([lx, ly]) => {
          const worldX = m[0] * lx + m[4] * ly + m[12];
          const worldY = m[1] * lx + m[5] * ly + m[13];

          const screenX = (worldX / this.viewport.width + 0.5) * canvasW;
          const screenY = (-worldY / this.viewport.height + 0.5) * canvasH;

          screenXs.push(screenX);
          screenYs.push(screenY);
        });

        // Get 2D bounding box of the projected corners
        const minX = Math.min(...screenXs);
        const maxX = Math.max(...screenXs);
        const minY = Math.min(...screenYs);
        const maxY = Math.max(...screenYs);

        // Convert mouse to screen pixels
        const mouseX = ((this.mouse.x + 1) / 2) * canvasW;
        const mouseY = ((-this.mouse.y + 1) / 2) * canvasH;

        // Check hitbox
        media.isHovered =
          mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;

        // media.quickView.show(media.isHovered);

        // Smooth scaling
        const targetScale = media.isHovered ? 1.1 : 1.0;
        if (!media.baseScaleX) {
          media.baseScaleX = media.plane.scale.x;
          media.baseScaleY = media.plane.scale.y;
        }

        media.plane.scale.x = lerp(
          media.plane.scale.x,
          media.baseScaleX * targetScale,
          0.1
        );
        media.plane.scale.y = lerp(
          media.plane.scale.y,
          media.baseScaleY * targetScale,
          0.1
        );
        // --- NEW: text fade animation ---

        if (media.isHovered) hovering = true;
      });
    }

    // Cursor
    this.container.style.cursor = hovering ? "pointer" : "grab";
    // --- original scroll/render ---
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener("resize", this.boundOnResize);
    window.addEventListener("mousewheel", this.boundOnWheel);
    window.addEventListener("wheel", this.boundOnWheel);
    window.addEventListener("mousedown", this.boundOnTouchDown);
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    window.addEventListener("touchstart", this.boundOnTouchDown);
    window.addEventListener("touchmove", this.boundOnTouchMove);
    window.addEventListener("touchend", this.boundOnTouchUp);

    //image scaling
    window.addEventListener("mousemove", (e) => {
      const rect = this.renderer.gl.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.mouse.x = (mx / rect.width) * 2 - 1; // normalized device coordinates
      this.mouse.y = -((my / rect.height) * 2 - 1);
    });
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    window.removeEventListener("mousewheel", this.boundOnWheel);
    window.removeEventListener("wheel", this.boundOnWheel);
    window.removeEventListener("mousedown", this.boundOnTouchDown);
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchstart", this.boundOnTouchDown);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    if (
      this.renderer &&
      this.renderer.gl &&
      this.renderer.gl.canvas.parentNode
    ) {
      this.renderer.gl.canvas.parentNode.removeChild(
        this.renderer.gl.canvas as HTMLCanvasElement
      );
    }
  }
}

interface CircularGalleryProps {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;

  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  scrollSpeed = 2,
  scrollEase = 0.05,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
    });
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
  return (
    <div
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      ref={containerRef}
    />
  );
}
