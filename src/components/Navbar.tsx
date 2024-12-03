import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { getServerSession } from "next-auth";
import { LogoutButton, SignInButton, SignUpButton } from "@/utils/Buttons";

export default async function Navbar() {
  const session = await getServerSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">MyApp</div>
      <div>
        {session ? (
          <div className="relative group flex items-center">
            <div className="mr-2">{session.user?.name}</div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <LogoutButton />
            </div>
          </div>
        ) : (
          <div>
            <SignInButton />
            <SignUpButton />
          </div>
        )}
      </div>
    </nav>
  );
}
