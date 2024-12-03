"use client";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type ButtonProps = {
  className: string;
  onClick: () => void;
  children: React.ReactNode;
};

function Button({ className, onClick, children }: ButtonProps) {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export function SignInButton() {
  return (
    <Button
      className="mr-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded"
      onClick={signIn}
    >
      Sign In
    </Button>
  );
}

export function SignUpButton() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <Button
      className="px-4 py-2 bg-gray-500 hover:bg-gray-700 rounded"
      onClick={handleSignUp}
    >
      Sign Up
    </Button>
  );
}

export function LogoutButton() {
  return (
    <Button
      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
      onClick={signOut}
    >
      Logout
    </Button>
  );
}
