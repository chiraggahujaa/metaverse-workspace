"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { getServerSession } from "next-auth";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">MyApp</div>
      <div>
        {session ? (
          <div className="relative group flex items-center">
            <div className="mr-2">
              {session.user?.username || "Chirag Ahuja"}
            </div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => signOut()}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              className="mr-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded"
              onClick={() => signIn()}
            >
              Sign In
            </button>
            <button
              className="px-4 py-2 bg-gray-500 hover:bg-gray-700 rounded"
              onClick={() => signIn()}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
