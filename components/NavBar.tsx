'use client'
import Link from "next/link"
import { SignedIn,SignedOut ,useAuth,SignInButton,UserButton, SignUpButton } from "@clerk/nextjs"
import {useState,useEffect} from 'react'
import { Menu, X, Zap} from 'lucide-react'


export function Navbar(){
    const {userId} = useAuth();
    const [isMenuOpen ,setIsMenuOpen]=useState(false)
    const [isScrolled ,setIsScrolled]=useState(false)
    const arr = [ 'Pricing']

    useEffect(()=>{
        const handleScrolle=()=>{
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll',handleScrolle);
        return ()=>window.removeEventListener('scroll',handleScrolle)

    },[])
   
    return (<>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/80 backdrop-blur-md" : "bg-transparent"}`}>
        <nav className=" container mx-auto px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-wrap justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center">
                <Link href={'/'} className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-500"></Zap>
                <span className="text-xl sm:text-2xl font-bold text-white">ThreadCraft AI</span>
                </Link>
                </div>
                <button className="sm:hidden focus:outline-none text-white" onClick={()=>setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/> }
                </button>
                <div className={` sm:w-auto w-full ${isMenuOpen ? "block" : "hidden"} sm:block mt-4 sm:mt-0`}>
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
                        {arr.map((items,index)=>(

                            <Link key={index} href={`/${items.toLowerCase()}`} className="text-gray-300 hover:text-white transition-color py-2 sm:py-0 relative group">
                                {items}
                                <span className="absolute bg-blue-500 left-0 right-0 bottom-0 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"></span>
                            </Link>
                        ))}
                        {userId && <Link href={'/generate'} className="text-gray-300 hover:text-white transition-color py-2 sm:py-0 relative group">
                        Dashboard
                        <span className="absolute bg-blue-500 left-0 right-0 bottom-0 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"></span>
                        </Link>}
                        <SignedOut>
                            <SignInButton mode="modal" >
                                <button className="text-gray-300 hover:text-white transition-colors mt-2 sm:mt-0">
                                 Sign In 
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn >
                            <UserButton appearance={{
                                elements:{
                                    avatarBox:"w-10 h-10"
                                }
                            }}>

                            </UserButton>
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>


    </header>
    
    </>)

}