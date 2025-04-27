"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Copy,
  Instagram,
  LinkedinIcon,
  Loader2,
  TwitterIcon,
  Upload,
  Zap,
} from "lucide-react";
import { GoogleGenerativeAI , Part } from "@google/generative-ai";
import { SignInButton, useUser } from "@clerk/nextjs";
import { creatOrUpdateUser, getGeneratedContentHistory, getUserPoints, savedGeneratedContent, updateUserPoints } from "../../../utils/db/actions";
import { useRouter } from "next/navigation";

import ReactMarkdown from "react-markdown"

const apiKey=process.env.NEXT_PUBLIC_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null 

const contentTypes = [
  { value: "Twitter", label: "Twitter Thread" },
  { value: "Instagram", label: "Instagram Caption" },
  { value: "LinkedIn", label: "LinkedIn Post" },
];


interface HistoryItem {
  id: number;
  userId: number;
  content: string;
  prompt: string;
  contentType: string;
  createdAt: Date;
}

const MAX_TWEET_LENGTH = 280
const POINTS_PER_GENETATION = 5


export default function GenerateContent() {
  const {isLoaded ,isSignedIn,user} = useUser()
  const [ContentType, setContentType] = useState(contentTypes[0].value);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [userPoints, setUserPoints] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  
  const router = useRouter()

  useEffect(()=>{
    if(!apiKey){
      console.error("Gemini API key is not set")
    }
  },[])

  
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !isSignedIn) {
        router.push("/sign-in");
      } else {
        console.log("User loaded:", user);
        await fetchUserPoints();
        await fetchContentHistory();
      }
    };
    fetchData();
  }, [isLoaded, isSignedIn, user, router]);

  const fetchUserPoints =async () => {
    
    if(user?.id){
      console.log("Fetching points for user:", user.id)
      const points = await getUserPoints(user.id);
      setUserPoints(points)
      console.log("Fetched points", points)
      if(points === 0){
        console.log("User has 0 points. Attempting to create/update user.")
        const updatedUser = await creatOrUpdateUser(
          user.id,
          user.emailAddresses[0].emailAddress,  
          user.fullName || ""
        )
        console.log("Updated user:", updatedUser)
        if(updatedUser){
          setUserPoints(updatedUser.points)
        }
      }
    }
  }


  const fetchContentHistory= async () => {
    if(user?.id){
      const contentHistory = await getGeneratedContentHistory(user?.id)
      setHistory(contentHistory)
    }
  }

  
  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if(
      !genAI || !user?.id || userPoints===null ||userPoints < POINTS_PER_GENETATION  )
      {
        alert("Not enough points or API key not set. ")
        return
      } 
      setIsLoading(true)
      try {
        const model =genAI.getGenerativeModel({model:"gemini-1.5-pro"})
        let promptText =`Generate ${ContentType} content about "${prompt}."`
        if (ContentType === "Twitter") {
          promptText += "Provide a theard of 5 tweets each under 280 characters."
        }
        let imagePart: Part | null = null
        if(ContentType === "Instagram" && image ){
          const reader = new FileReader()
          const imageData = await new Promise<string>((resolve)=> {
            reader.onload =(e)=>{
              if(e.target && typeof e.target.result === "string")
              {
                resolve(e.target.result)
              }
              else{
                resolve("")
              }
            }
            reader.readAsDataURL(image)
          })

          const base64Data = imageData.split(",")[1];
          if(base64Data){
            imagePart={
              inlineData:{
                data:base64Data,
                mimeType: image.type
              }
            }
          }
          promptText +="Describe the image and incorporate it into the caption."

        }
        const parts: (string | Part)[] = imagePart ? [promptText, imagePart] : [promptText];


        const result = await model.generateContent(parts)
        const generatedText = result.response.text()

        let content: string[]
        if (ContentType === "Twitter"){
          content = generatedText.split("\n\n").filter((tweet) => tweet.trim() !== "")
        }else{
          content =[generatedText]
        }

        setGeneratedContent(content);

        if(user?.id){
          
          const updateUser = await updateUserPoints(user.id , -POINTS_PER_GENETATION)
          if(updateUser){
            setUserPoints(updateUser.points)
        }
        }
        const savedContent = await savedGeneratedContent(
          user.id ,
          content.join("\n\n"),
          prompt,
          ContentType
        )
        if (savedContent){
          setHistory((prevHistory)=>[savedContent, ...prevHistory])
        }
      } catch (error) {
        console.error("Error generating content:",error)
        setGeneratedContent(["An error occurred while generating content. "])
      }
      finally{
        setIsLoading(false)
      }
  }

  if(!isLoaded){
    return <div className="flex justify-center items-center mt-48">loading...</div>
  }
  if(!isSignedIn){
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center bg-[#111111] p-8 rounded-lg shadow-lg ">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to TheardCraft AI
          </h1>
          <p className="text-gray-400 mb-6">To start genrating amazing content, please sign in or create an account. </p>
          <SignInButton mode="modal">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign In / Sign Up
          </Button>
          </SignInButton>
          <p className="text-gray-500 mt-4 text-sm">By signing in, you agree to our Terms of Service and Privacy Police</p>
        </div>
      </div>
    )
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen">
      <div className="container mx-auto px-4 mb-8 lg:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 mt-14 gap-8">
          {/* History Section */}
          <div className="lg:col-span-1 bg-gray-800 rounded-2xl p-6 max-h-[450px] overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-400 mb-8">History</h2>
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
              {/* يمكنك إضافة المحتوى هنا إذا كان لديك بيانات محفوظة */}
              <div className="space-y-4  ">
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="block bg-gray-700 p-4 rounded-xl">
              <span className="text-white block">{item.contentType}</span>
           <p className="text-gray-300 mt-2 block">{item.prompt}</p> 
              <span className="text-gray-400 text-sm block">{new Date(item.createdAt).toLocaleString()}</span>

            </div>
          ))
        ) : (
          <p className="text-gray-400">No history available.</p>
        )}

            </div>
          </div>

          {/* Main Content Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points Section */}
            <div className="bg-gray-800 p-6 rounded-2xl flex items-center justify-between order-first">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Available Points</p>
                  <p className="text-2xl text-yellow-400 font-bold">{userPoints}</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/pricing">Get More Points</Link>
              </Button>
            </div>


            {/* Content Type Selection */}
            <div className="bg-gray-800 p-6 rounded-2xl space-y-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Content Type
              </label>
              <Select onValueChange={setContentType} defaultValue={ContentType}>
                <SelectTrigger className="w-full bg-gray-700 border-none rounded-xl">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="ml-2 bg-gray-900 w-full"
                    >
                      <div className="flex items-center ml-4">
                        {type.value === "Twitter" && (
                          <TwitterIcon className="mr-2 h-4 w-4 text-blue-400" />
                        )}
                        {type.value === "Instagram" && (
                          <Instagram className="mr-2 h-4 w-4 text-pink-400" />
                        )}
                        {type.value === "LinkedIn" && (
                          <LinkedinIcon className="mr-2 h-4 w-4 text-blue-600" />
                        )}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Input */}
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-2 text-gray-300"
              >
                Prompt
              </label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border-none rounded-xl resize-none"
              />
            </div>

            {/* Image Upload for Instagram */}
            <div>
            {ContentType === "Instagram" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Upload Image
                </label>
                <div className="flex items-center space-x-3 my-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    <span>Upload Image</span>
                  </label>
                  {image && (
                    <span className="text-sm text-gray-400">{image.name}</span>
                  )}
                </div>
              </div>
            )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || userPoints === null || userPoints < POINTS_PER_GENETATION}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate Content (${POINTS_PER_GENETATION} points)`
            )}
          </Button>

            </div>

              {(selectedHistoryItem || generatedContent.length > 0 ) && (
                <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
                  <h2 className="text-2xl font-semibold text-blue-400">
                    {selectedHistoryItem ? "History Item" : "Generated Content"}
                  </h2>
                  {ContentType === "Twitter" ? (
                    <div className="space-y-4">
                      {(selectedHistoryItem ? selectedHistoryItem.content.split("\n\n") : generatedContent 
                      ).map((tweet,index)=>(
                        <div key={index} className="bg-gray-700 p-4 rounded-xl relative">
                          <div className="prose prose-invert max-w-none mb-2 text-sm">
                          <ReactMarkdown >
                            {tweet}
                          </ReactMarkdown>
                          </div>
                          <div className="flex justify-between items-center text-gray-300">
                            <span>
                              {tweet.length}/{MAX_TWEET_LENGTH}
                            </span>
                            <Button onClick={()=> copyToClipboard(tweet)} className="bg-gray-600 hover:bg-gray-500 text-white">
                              <Copy className="h-4 w-4"/>
                            </Button>
                          </div>
                        </div>
                      ))
                      
                      }
                    </div>
                  ):<div className="bg-gray-700 p-4 rounded-xl">
                    <div className="prose prose-invert max-w-none text-sm">
                    <ReactMarkdown >
                      {selectedHistoryItem ? selectedHistoryItem.content : generatedContent[0]}
                    </ReactMarkdown>
                    </div>
                  </div> }
                </div>
              )}

          </div>
        </div>
      </div>
    </div>
  );
}
