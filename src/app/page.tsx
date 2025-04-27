// "use client"
import Image from "next/image";
import { ArrowRightIcon, CheckCircleIcon, Feather, Instagram, LinkedinIcon, RocketIcon, SparkleIcon, TrendingUpIcon, TwitterIcon, ZapIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";


export default function Home() {
  const {userId} = auth()
  return (
    // p-8 pb-20 gap-16 sm:p-20
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen  font-[family-name:var(--font-geist-sans)]">
      <main className="container max-w-[1200px] mx-auto  relative ">
        <div className="absolute top-40 lg:top-48 left-10 animate-float animation-delay ">
          <SparkleIcon className="w-8 h-8 text-yellow-400 opacity-50 "/>
        </div>
        <div className="absolute top-48 md:top-50 lg:top-[290px] right-20 animate-float animation-delay ">
          <ZapIcon className="w-10 h-10 text-blue-400 opacity-50 "/>
        </div>
        <div className="absolute bottom-40 left-1/4 animate-float animation-delay">
          <TrendingUpIcon className="w-12 h-12 text-green-400 opacity-50 "/>
        </div>
      </main>

      <div className="text-center pt-28 lg:pt-40 my-20 relative max-w-[1200px] mx-auto">
        <RocketIcon className="w-16 h-16 text-purple-500 mx-auto mb-6 animate-float1 animation-delay"/>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-purple-500">
          AI-Powered Social Media Content Generator 
        </h1>
        <p className="text-xl mb-10 text-gray-500 max-w-2xl mx-auto">
          Create engaging content for Twitter, Instagram, and LinkedIn With cutting-edge AI technology.
        </p>
      </div>
      <div className="flex justify-center items-center space-x-4 mt-[-110px]  max-w-[1200px] mx-auto">
        <Button 
        asChild
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          <Link href={'/generate'}>Start Creating</Link>
        </Button>
        <Button 
        asChild
        className="bg-transparent hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-600 hover:border-none transition-all px-8 py-3 rounded-lg"
        >
          <Link href={'#features'}>Learn More</Link>
        </Button>
      </div>


      <div className="py-20 my-[60px] max-w-[1200px] mx-auto" id="features">
        <h2 className="text-3xl font-bold mb-16 text-center text-white ">
          Supercharge Your Social Media Presence 
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-auto ">
          {[
            
            {
              title: "Twitter Theards",
              icon:<TwitterIcon className="w-10 h-10 mb-4 text-blue-500"/>,
              description:"Generate compelling Twitter theards that engage your audience and boost your reach"
            },
            {
              title: "Instagram Captions",
              icon:<Instagram className="w-10 h-10 mb-4 text-purple-700"/>,
              description:"Generate compelling Instagram theards that engage your increase engangement and followers"
            },
            {
              title: "LinkedIn Posts",
              icon:<LinkedinIcon className="w-10 h-10 mb-4 text-blue-600"/>,
              description:"Craft professional content for your LinkedIn netword to establish throught leadership "
            },
          ].map((feature,index)=><div
          key={index}
          className="p-8 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 hover:scale-[102%] transition-all duration-500"
          >
            <div className="flex flex-col items-center text-center  ">
              {feature.icon}
              <h3 className="text-2xl font-semibold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          </div>
          
          )}
        </div>
      </div>


      <div className="py-20 mt-20 bg-gray-900 rounded-3xl relative w-full" >
        
        <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-16 text-center text-white ">
          Why Choose Our AI Content Generator?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto  ">
          {[
            "Save time and effort on content creating",
            "Consistently produce hight-quality posts",
            "Increase engagement across all platforms ",
            "Stay ahead of social media treads",
            "Customize content to match your brand voice",
            "Scale your social media presence effortlessly",
          ].map((benefit,index)=><div key={index} className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink"/>
            <span className="text-gray-300">{benefit}</span>
          </div>
          
          )}
        </div>
        </div>
        </div>


        <div className="text-center py-20 relative bg-gray-900/50 rounded-3xl  w-full mt-8">
          <h2 className="text-4xl text-white font-bold mb-8">
            Ready to revolutionize your social media strategy?
          </h2>
          {userId ? (
            <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4"
            >
              <Link href={"/generate"}>
                Generate Content Now <ArrowRightIcon className="ml-2 h-5 w-5"/>
              </Link>
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4">
                Get Started Free <ArrowRightIcon className="ml-2 h-5 w-5"/>
              </Button>
            </SignUpButton>
          )}
          <p className="mt-4 text-gray-400">No credit card required</p>
        </div>
    </div>
  );
}
