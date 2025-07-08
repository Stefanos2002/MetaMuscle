export default function Navbar() {
  return (
    <div className="w-full h-auto bg-black">
      <nav className="flex items-center h-auto  justify-around">
        <div className="flex items-center">
          <img
            src={`images/logo/page_logo.png`}
            alt="Meta-Muscle Logo"
            className="h-24 w-24 object-contain translate-y-[10px]"
          ></img>
          <span className="text-white font-black text-2xl leading-none">
            Meta-Muscle
          </span>
        </div>
        <ul className="text-white text-xl flex space-x-6">
          <li className="group cursor-pointer relative ">
            <span>Shop</span>
            <ul className="absolute -left-16 mt-2 hidden group-hover:flex flex-col items-center bg-black text-white border border-gray-700 rounded shadow-lg z-50 p-2 space-y-1 w-44">
              <li>All Products</li>
              <li>Whey Protein</li>
              <li>Plant-Based</li>
              <li>Mass Gainers</li>
              <li>Pre/Post Workout</li>
            </ul>
          </li>

          <li className="cursor-pointer">Contact Us</li>
          <li className="cursor-pointer">About Us</li>
        </ul>
      </nav>
    </div>
  );
}
