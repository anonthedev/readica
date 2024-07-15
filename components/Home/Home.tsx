"use client";

import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main
      className={`relative w-screen min-h-[calc(100vh-80px)] flex flex-row items-center justify-between md:px-8  bg-center bg-cover bg-no-repeat`}
    >
      {/* <div className="absolute top-20 -left-4 w-[680px] h-[477px] bg-[#53FFB7] rounded-full filter blur-[138px] opacity-100 rotate-[26deg]"></div> */}
      {/* <svg
        className="absolute"
        width="880"
        height="980"
        viewBox="0 0 880 980"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_277_824)">
          <path
            d="M599.804 746.98C563.002 822.431 257.389 694.564 145.702 640.089C34.0152 585.613 -19.041 510.223 10.1099 404.836C39.2608 299.449 366.017 9.33053 375.259 334.827C384.501 660.323 636.605 671.529 599.804 746.98Z"
            fill="#53FFB7"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_277_824"
            x="-273.779"
            y="-91.1418"
            width="1153.25"
            height="1137.35"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="138"
              result="effect1_foregroundBlur_277_824"
            />
          </filter>
        </defs>
      </svg>

      <svg
        className="absolute -bottom-1/3 left-1/4"
        width="1181"
        height="781"
        viewBox="0 0 1181 781"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_277_828)">
          <path
            d="M311.982 540.545C201.359 555.919 366.521 302.12 547.827 302.12C729.133 302.12 725.781 232.429 838.584 324.038C951.387 415.646 927.104 493.315 702.826 559.677C478.547 626.039 422.604 525.171 311.982 540.545Z"
            fill="#24FFF2"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_277_828"
            x="0.238525"
            y="0.745556"
            width="1180.1"
            height="857.778"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="138"
              result="effect1_foregroundBlur_277_828"
            />
          </filter>
        </defs>
      </svg>

      <svg
        className="absolute right-0"
        width="731"
        height="980"
        viewBox="0 0 731 980"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_277_826)">
          <path
            d="M600.107 668.005C498.609 718.728 139.071 827.634 333.028 593.165C526.986 358.697 248.407 358.373 396.135 227.794C543.864 97.2139 633.234 210.58 679.239 302.636C725.245 394.693 701.605 617.281 600.107 668.005Z"
            fill="#2489FF"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_277_826"
            x="0.532715"
            y="-107.327"
            width="977.211"
            height="1121.23"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="138"
              result="effect1_foregroundBlur_277_826"
            />
          </filter>
        </defs>
      </svg> */}

      {/* <div className="absolute -bottom-8 left-1/3 w-[580px] h-[300px] bg-[#24FFF2] rounded-full filter blur-[138px] opacity-100"></div> */}
      <section className="relative flex flex-col items-center justify-center gap-10 w-full">
        <div className="flex flex-col gap-4 max-w-prose text-center items-center justify-center">
          <h1 className="text-3xl font-bold">
            Organise your research papers with Readica
          </h1>
          <p className="font-medium">
            Readica lets you access research papers, save them to your library
            and even take notes, all at your fingertips!
          </p>
          {isLoaded && isSignedIn && (
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/dashboard"
            >
              Dashboard
            </Link>
          )}
          {isLoaded && !isSignedIn && (
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/sign-in"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
