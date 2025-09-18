import styles from "../Menu.module.css";
import { Link, Outlet } from "react-router";

export default function Navbar() {
  return (
    <>
      <div className="w-full h-auto bg-black">
        <nav className="flex items-center h-auto  justify-around">
          <div className="flex items-center">
            <img
              src={`images/logo/page_logo.png`}
              alt="Meta-Muscle Logo"
              className="h-24 w-24 object-contain translate-y-[10px] translate-x-[16px]"
            ></img>
            <span className="text-white font-black text-2xl leading-none">
              <Link to="/">Meta-Muscle</Link>
            </span>
          </div>
          <ul className="text-white text-xl flex space-x-6">
            <li className="group cursor-pointer relative">
              <span className="block group-hover:scale-110 transition-transform duration-200">
                Shop
              </span>
              {/* Invisible bridge */}
              <div className="absolute top-full w-44 -left-16 h-2"></div>
              <ul
                className={`${styles.submenu} absolute mt-2 -left-16 hidden group-hover:flex flex-col items-center bg-black text-white border-2 border-gray-200 rounded-lg shadow-lg z-50 p-3 space-y-1 w-max`}
              >
                <li>
                  <Link to="/all-products">All Products</Link>
                </li>
                <li>
                  <Link to="/whey-protein">Whey Protein</Link>
                </li>
                <li>
                  <Link to="/plant-based">Plant Based</Link>
                </li>
                <li>
                  <Link to="/mass-gainers">Mass Gainers</Link>
                </li>
                <li>
                  <Link to="/pre-post-workout">Pre/Post Workout</Link>
                </li>
              </ul>
            </li>

            <li className="cursor-pointer">
              <Link to="/contact">Contact Us</Link>
            </li>
            <li className="cursor-pointer">
              <Link to="/about">About Us</Link>
            </li>
          </ul>
        </nav>
      </div>
      {/* this is neccessary for the page to work */}
      <Outlet />
    </>
  );
}
