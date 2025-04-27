
import { db } from './dbConfig';
import {sql , eq , desc} from 'drizzle-orm'
import { User , Subscriptions, GeneratedContent} from './schema'
import { sendWelcomeEmail } from '../mailtrap';


export async function updateUserPoints(userId: string, points: number) {
    try {
        const [updatedUser] = await db
        .update(User)
        .set({ points: sql` ${User.points} + ${points}`})
        .where(eq(User.stripeCustomerId, userId))
        .returning()
        .execute()

        return updatedUser
    } catch (error) {
        console.error("Error updating user points:",error)
        return null
    }
}

export async function createOrUpdateSubscription(
    userId:string,
    stripeSubscriptionId:string,
    plan:string,
    status:string,
    currentPeriodStart:Date,
    currentPeriodEnd:Date,
) {
    try {
        const [user] = await db
        .select({ id: User.id})
        .from(User)
        .where(eq(User.stripeCustomerId, userId))
        .limit(1)
        if(!user){
            console.error(`No user found with stripeCustomerId:${userId}`)
            return null
        }

        const existingSubscription = await db
        .select()
        .from(Subscriptions)
        .where(eq(Subscriptions.stripeSubscriptionId,stripeSubscriptionId))
        .limit(1)

        let subscription;
        if(existingSubscription.length > 0){
            [subscription] = await db
            .update(Subscriptions)
            .set({
                plan,
                status,
                currentPeriodStart,
                currentPeriodEnd,
                
            })
            .where(eq(Subscriptions.stripeSubscriptionId,stripeSubscriptionId))
            .returning()
            .execute()
        }
        else {
            [subscription] = await db
                .insert(Subscriptions)
                .values({
                    userId:user.id,
                    stripeSubscriptionId,
                    plan,
                    status,
                    currentPeriodStart,
                    currentPeriodEnd,
                })
                .returning()
                .execute();
        }
        return subscription; 
    } catch (error) {
        console.error("Error create or update subscription",error)
        return null
    }
}

export async function creatOrUpdateUser(
    clerkUserId:string,
    email:string,
    name:string
){
    try {
        const[existingUser]= await db.select().from(User).where(eq(User.stripeCustomerId,clerkUserId)).limit(1).execute();
        if(existingUser){
            const[updatedUser]= await db.update(User).set({name, email}).where(eq(User.stripeCustomerId , clerkUserId)).returning().execute();
            console.log('Update_user' , updatedUser);
            return updatedUser
        }
        const [newUser] = await db.insert(User).values({email ,name ,stripeCustomerId:clerkUserId , points:50}).returning().execute()
        console.log('new user created' ,newUser)
        sendWelcomeEmail(email,name)
    } catch (error) {
        console.error("Creating or updating user:", error)
        return null
    }
}

export async function savedGeneratedContent(
    userId:string,
    content:string,
    prompt:string,
    contentType:string,
    ) {
    try {
        const [saveContent] = await db
        .insert(GeneratedContent)
        .values({
            userId: sql`(SELECT id FROM ${User} WHERE stripe_customer_id = ${userId})`,
            content,
            prompt,
            contentType
        })
        .returning()
        .execute()
        return saveContent
        
    } catch (error) {
        console.error("Error saving generated content", error)
        return null
    }
}

export async function getUserPoints(userId:string) {
    try {
        console.log("Fetching points for user", userId)
        const users = await db 
        .select({points: User?.points, id: User?.id, email: User?.email})
        .from(User) 
        .where(eq(User.stripeCustomerId,userId))
        .execute()
        console.log("Fetched users:", users)
        if(users.length === 0){
            console.log("No User found with stripCustomerId", userId)
            return 0
        }
    } catch (error) {
        console.error("Error fetching user points:", error)
        return 0
    }
    
}



export async function getGeneratedContentHistory(userId:string,limit:number=10) {
    try {
        const history = await db
        .select({
            id: GeneratedContent.id,
            userId:GeneratedContent.userId,
            content: GeneratedContent.content,
            prompt: GeneratedContent.prompt,
            contentType: GeneratedContent.contentType,
            createdAt: GeneratedContent.createdAt
        })
        .from(GeneratedContent)
        .where(eq(GeneratedContent.userId,sql`(SELECT id FROM ${User} WHERE stripe_customer_id = ${userId})`))
        .orderBy(desc(GeneratedContent.createdAt))
        .limit(limit)
        .execute()
        return history
    } catch (error) {
        console.error("Error fetching generated content history: ", error)
        return [];
    }
}