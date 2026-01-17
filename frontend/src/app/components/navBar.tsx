"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon } from "lucide-react";
import api from "@/lib/api";

const navLinks = [
  { name: "home", href: "/" },
  { name: "problem", href: "/problem" },
  { name: "battle", href: "/battle" },
  { name: "contest", href: "/contest" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-7 bg-[#F0F1F6] h-[8vh] z-50">
      <div className="flex items-center gap-2">
        <svg
          width="40"
          height="40"
          viewBox="0 0 52 57"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_20_238)">
            <path
              d="M6.77761 46.4769C6.09812 46.4769 5.46719 46.8698 5.10949 47.5153L1.76846 53.5442C0.959318 55.0046 1.90012 56.8904 3.43755 56.8904H34.8932C35.5973 56.8904 36.2483 56.4687 36.5977 55.7857L41.3577 46.4769H6.77761Z"
              fill="#6266F0"
            />
            <path
              d="M29.3507 21.7963C28.9923 22.4827 28.9937 23.3322 29.3555 24.0165L41.2354 46.4769H49.9669C51.4747 46.4765 52.4188 44.6552 51.6685 43.1938L35.065 10.8497L29.3507 21.7963Z"
              fill="#282828"
            />
            <path
              d="M1.96515 10.9615C0.466978 10.9617 -0.478683 12.762 0.252002 14.2233L16.4014 46.5106L21.3013 35.564C21.5883 34.9223 21.5762 34.1643 21.2687 33.5344L10.2492 10.9615H1.96515Z"
              fill="#282828"
            />
            <path
              d="M16.7209 0C16.0029 0 15.342 0.438091 14.9981 1.14218L10.2036 10.9615H45.6949C46.4129 10.9615 47.0738 10.5234 47.4177 9.81936L50.6293 3.24243C51.3425 1.78167 50.3958 0.000326679 48.9066 0H16.7209Z"
              fill="#6266F0"
            />
          </g>
          <defs>
            <clipPath id="clip0_20_238">
              <rect width="52" height="57" fill="white" />
            </clipPath>
          </defs>
        </svg>

        <span className="font-bold text-[22px] sm:text-[27px] text-gray-800">
          <span className="text-gray-800">Syntax</span>
          <span className="text-[#6266F0]">Rush</span>
        </span>
      </div>

      <div className="hidden md:flex flex-1 justify-center scale-90">
        <div className="flex gap-4 px-2 py-1 mr-[7%] mt-1 rounded-full border border-gray-400 bg-white/50 shadow-sm">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={
                `px-5 py-2 rounded-full font-semibold transition active:bg-gray-800 active:text-white ` +
                (pathname === link.href
                  ? "bg-[#1F2937] text-white pt-2"
                  : "hover:bg-gray-100 pt-2 text-[#484848]")
              }
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        {!loading && (
          user ? (
            <img
              src={user.profilePicture || "/profile.png"}
              alt="Profile"
              className="h-12 w-12 rounded-full bg-gray-300 object-cover cursor-pointer border-2 border-white shadow-sm"
              onClick={() => (window.location.href = "/profile")}
            />
          ) : (
            <div className="flex gap-4">
              <a
                href="/login"
                className="px-6 py-2 rounded-full font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Login
              </a>
              <a
                href="/signup"
                className="px-6 py-2 rounded-full font-semibold bg-[#6266F0] text-white shadow-md hover:bg-indigo-700 transition"
              >
                Sign Up
              </a>
            </div>
          )
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-200"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen && (
        <div className="absolute top-[8vh] left-0 w-full bg-white shadow-lg border-t border-gray-300 flex flex-col items-center py-6 gap-4 md:hidden z-50 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={
                `px-6 py-2 rounded-full font-semibold transition ` +
                (pathname === link.href
                  ? "bg-[#1F2937] text-white"
                  : "text-[#484848] hover:bg-gray-100")
              }
            >
              {link.name}
            </a>
          ))}
          {!loading && (
            user ? (
              <a
                href="/profile"
                className="flex items-center gap-2 mt-2 px-6 py-2 rounded-full bg-gray-100"
              >
                <img
                  src={user.profilePicture || "/profile.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border"
                />
                <span className="font-medium">{user.username}</span>
              </a>
            ) : (
              <div className="flex flex-col gap-2 w-full px-10 mt-4">
                <a
                  href="/login"
                  className="w-full py-3 rounded-xl font-semibold text-center text-gray-700 bg-gray-100"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="w-full py-3 rounded-xl font-semibold text-center text-white bg-[#6266F0]"
                >
                  Sign Up
                </a>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
