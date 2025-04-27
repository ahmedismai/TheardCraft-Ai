"use client"

import { CheckIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"

const pricingPlans=[{
    name:"Basic",
    price:"9",
    priceId:"price_1Qu02GCelXlf3qIpwI7kRRlM",
    features:[
        "100 AI-generated posts per month",
        "Twitter thread generation",
        "Basic analytics",
    ],
},
{
    name:"Pro",
    price:"29",
    priceId:"price_1Qu07SCelXlf3qIpxFEo98k5",
    features:[
        "500 AI-generated posts per month",
        "Twitter, Instagram, and LinkedIn content",
        "Advanced analytics",
        "Priority support"
    ],
},
{
    name:"Enterprise",
    price:"Custom",
    priceId:null,
    features:[
        "Unlimited AI-generated posts",
        "All social media platforms",
        "Custom AI model training",
        "Dedicated account manager"
    ],
},
]

export default function PricingPage(){
    const {user,isSignedIn} =useUser()
    const [isLoading,setIsLoading]=useState(false)

    const handleSubscribe = async (priceId:any )=>{
        if(isLoading){
            return
        }
        setIsLoading(true)
        try {
            const response = await fetch("/api/create-checkout-session",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({priceId,userId : user?.id})
            });
            if(!response.ok){
                const errorData = await response.json()
                throw new Error(errorData.error || "Feiled to create checkout session")
            }
            const {sessionId} =await response.json();
            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
            if(!stripe){
                throw new Error("Feiled to load Stripe")
            }
            await stripe.redirectToCheckout({sessionId})
        } catch (error) {
            console.error("Error create checkout session ", error)
        }
        finally{
            setIsLoading(false)
        }
    }
    return (
        <>
            <div className="min-h-screen bg-black text-gray-100">
                <main className="container mx-auto px-8 py-20">
                    <h1 className="text-5xl font-bold mb-12 text-center text-white">
                        Pricing Plans
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-8">
                        {pricingPlans.map((plan,index)=>(
                            <div key={index} className="p-8 rounded-lg border border-gray-800 flex flex-col">
                                  <h2 className="text-2xl font-bold mb-4 text-white ">
                                    {plan.name}
                                    </h2>  
                                    <p className="text-4xl font-bold mb-6 text-white">
                                      ${plan.price}  
                                    <span className="text-lg font-normal text-gray-400">
                                        /month
                                    </span>
                                    </p>
                                    <ul className="mb-8 flex-grow">
                                        {plan.features.map((feature,index)=>(
                                            <li key={index} className="flex items-center mb-3 text-gray-400">
                                                <CheckIcon className="w-5 h-5 mr-2 text-green-500"/>
                                               {feature} 
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                    onClick={()=>handleSubscribe(plan.priceId)} 
                                    disabled={isLoading || !plan.priceId}
                                    className="w-full bg-white text-black hover:bg-gray-900 hover:text-white">
                                        {isLoading ? "Processing...":"Choose Plan"}
                                    </Button>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    )
}