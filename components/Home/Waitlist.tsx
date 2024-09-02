"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import bg from "@/resources/images/home-bg.png";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@clerk/nextjs";
import { FormEvent, useState } from "react";
import axios from "axios";

export default function Waitlist() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function addToWaitlist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const token = await getToken({ template: "supabase" });

    await axios
      .post(
        `/api/waitlist`,
        { email, name },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((resp) => {
        toast({ title: resp.data.message, variant: "success" });
      })
      .catch((error) => {
        console.log(error)
        toast({ title: error.response.data.error, variant: "destructive" });
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return (
    <main
      className="relative flex flex-col gap-6 overflow-x-hidden h-dvh items-center justify-center font-inter"
      style={{
        backgroundImage: `url(${bg.src})`,
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <section className="relative z-10 w-[calc(400px+2rem)] flex flex-col gap-10 p-8 rounded-2xl bg-white text-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 shadow-[0px_4px_16px_0px_#FFFFFF14]">
        <div className="flex flex-col gap-3 w-full items-center justify-center text-center">
          <h1 className="text-[32px] ">Get Early Access to Readica</h1>
          <p>
            Readica is still a wip, but you can sign up to be the first to get
            access to Readica!
          </p>
        </div>
        <form
          onSubmit={(e) => {
            addToWaitlist(e);
          }}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              placeholder="Enter your name"
              className="bg-white text-white bg-opacity-20 border-none focus:border-none focus:outline-1 focus:outline-white foucs:outline-bold placeholder:text-white"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              className="bg-white text-white bg-opacity-20 border-none focus:outline-1 focus:outline-white foucs:outline-bold placeholder:text-white"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <Button disabled={loading} type="submit" className="w-full bg-purple">
            {loading ? "Adding..." : "Join Waitlist"}
          </Button>
        </form>
      </section>
      <span className="relative z-10 text-xs text-white">
        Made by{" "}
        <a
          className="underline"
          href="https://twitter.com/anonthedev"
          target="_blank"
        >
          Pranav
        </a>{" "}
        &{" "}
        <a
          className="underline"
          href="https://twitter.com/n4gpal"
          target="_blank"
        >
          Lakshay
        </a>
      </span>
    </main>
  );
}
