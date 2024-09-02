import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import bg from "@/resources/images/home-bg.webp"

export default function Waitlist() {
  return (
    <main className="relative flex flex-col gap-6 w-screen h-dvh items-center justify-center" style={{backgroundImage: `url(${bg.src})`, backgroundColor: "black", backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <section className="relative z-10 w-[calc(400px+2rem)] flex flex-col gap-10 p-8 rounded-2xl bg-white text-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 shadow-[0px_4px_16px_0px_#FFFFFF14;]">
        <div className="flex flex-col gap-3 w-full items-center justify-center text-center">
          <h1 className="text-[32px] ">Get Early Access to Readica</h1>
          <p>
            Readica is still in wip, but you can sign up to be the first to get
            access to Readica!
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input placeholder="Enter your name" className="bg-white bg-opacity-20 border-none focus:outline-1 focus:outline-white foucs:outline-bold" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input placeholder="Enter your email" className="bg-white bg-opacity-20 border-none focus:outline-1 focus:outline-white foucs:outline-bold" />
          </div>
          <Button className="w-full bg-purple">Join Waitlist</Button>
        </div>
      </section>
      <span className="relative z-10 text-xs text-white">
        Made by <a className="underline" href="https://twitter.com/anonthedev">Pranav</a> &{" "}
        <a className="underline" href="https://twitter.com/n4gpal">Lakshay</a>
      </span>
    </main>
  );
}
