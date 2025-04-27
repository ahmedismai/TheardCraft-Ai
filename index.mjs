import { MailtrapClient } from "mailtrap";

const TOKEN = "cc46518645e49c5e3f386651e04cb675"
const SENDER_EMAIL="hello@demomailtrap.com"
const RECIPIENT_EMAIL="ahmedismailamer@gmail.com"



if(!TOKEN){
    throw new Error('MAILTRAP_TOKEN environment variable is not set')
}

const client = new MailtrapClient({token: TOKEN})
const sender = {name: "Mailtrap Test", email: SENDER_EMAIL}

client.send({
    from:sender,
    to:[{email:RECIPIENT_EMAIL}],
    subject:"Hello to mailtrap",
    text:"Welcome to threadcraft AI"
}).then(console.log).catch(console.error)