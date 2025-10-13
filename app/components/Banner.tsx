import CircularGallery from "./CircularGallery";
export default function Banner() {
  return (
    <div className="h-full relative">
      <CircularGallery
        font="bold 40px sans-serif"
        bend={3}
        textColor="#000"
        borderRadius={0.05}
        scrollEase={0.02}
      />
    </div>
  );
}
