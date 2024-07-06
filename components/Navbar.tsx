import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="py-4 px-20 flex flex-row items-center justify-between md:px-10">
      <span className="text-4xl font-bold">
        read<span className="text-yellow-500">ica.</span>
      </span>
      <div className="">
        <SignedIn>
          {/* <div className="flex flex-row gap-5 items-center"> */}
          <UserButton />
          {/* </div> */}
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </nav>
  );
}
