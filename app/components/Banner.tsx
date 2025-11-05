import CircularGallery from "./CircularGallery";
import LightRays from "./LightRays";
import TextType from "./TextType";
import { HiOutlineChevronDoubleDown } from "react-icons/hi2";

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
      <header className="text-white text-3xl h-10 flex mt-44 justify-center inset-0 absolute z-10">
        <TextType
          text={["Choose Between Best Quality Products"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
        />
      </header>
      {/* <header className="text-white text-3xl h-10 flex mt-44 justify-center inset-0 absolute z-10">
        Choose Between Best Quality Products
      </header> */}

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <CircularGallery
          font="bold 60px montserrat"
          bend={4}
          textColor="#e8e8e8"
          borderRadius={0.05}
          scrollEase={0.02}
        />
      </div>
      <button className="inset-0 h-10 w-10 mb-5 flex flex-col items-center justify-end absolute z-10">   
        <HiOutlineChevronDoubleDown className="text-white text-6xl" />
      </button>
    </div>
  );
}
