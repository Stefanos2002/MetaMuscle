import CircularGallery from "./CircularGallery";
import LightRays from "./LightRays";
export default function Banner() {
  return (
    <div className="h-full relative">
      <LightRays
        raysOrigin="top-center"
        raysColor="#b9bfff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="absolute inset-0 z-0 bg-gradient-to-b from-[#0b0b14] to-[#000000]"
      />
      <div className="absolute pt-12 inset-0 z-10 flex items-center justify-center">
        <CircularGallery
          font="bold 44px sans-serif"
          bend={3.5}
          textColor="#fff"
          borderRadius={0.05}
          scrollEase={0.02}
        />
      </div>
    </div>
  );
}
