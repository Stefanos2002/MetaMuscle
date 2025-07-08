import styles from "../Menu.module.css";
import { Link } from "react-router";

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
            {/* Invisible bridge */}
            <div className="absolute top-full w-44 -left-16 h-2"></div>
            <ul
              className={`${styles.submenu} absolute mt-2 -left-16 hidden group-hover:flex flex-col items-center bg-black text-white border border-gray-700 rounded shadow-lg z-50 p-2 space-y-1 w-44`}
            >
              <li className="hover:scale-105 transition-all ease-in-out duration-100">
                <Link to="/all-products">All Products</Link>
              </li>
              <li className="hover:scale-105 transition-all ease-in-out duration-100">
                <Link to="/whey-protein">Whey Protein</Link>
              </li>
              <li className="hover:scale-105 transition-all ease-in-out duration-100">
                <Link to="/plant-based">Plant Based</Link>
              </li>
              <li className="hover:scale-105 transition-all ease-in-out duration-100">
                <Link to="/mass-gainers">Mass Gainers</Link>
              </li>
              <li className="hover:scale-105 transition-all ease-in-out duration-100">
                <Link to="/pre-post-workout">Pre/Post Workout</Link>
              </li>
            </ul>
          </li>

          <li className="cursor-pointer">Contact Us</li>
          <li className="cursor-pointer">About Us</li>
        </ul>
      </nav>
    </div>
  );
}
