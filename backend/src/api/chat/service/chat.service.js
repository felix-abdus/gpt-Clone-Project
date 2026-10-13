import "dotenv/config"
import db from "../../../../db/db.config.js";
//select history/prev-questions
//save new question
//prompt + context
//model request

export const getRecentConversationRows = async (limit=5) => {
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isNaN(normalizedLimit) || normalizedLimit <= 0? 20: normalizedLimit;
    const [rows] = await db.query(
        `SELECT id, role, content, created_at
        FROM conversations
        ORDER BY id DESC
        LIMIT ${safeLimit}`
    )
    return rows.reverse();
}


//==================

import { GoogleGenAI } from "@google/genai";
const GEMINI_MODEL= process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'




//* //initialize google instance to see if our key is working
const geminiClient = new GoogleGenAI({
        apiKey:process.env.GEMINI_API_KEY
})

//*create a fun to api call to test
// async function main() {
//     const response = await geminiClient.models.generateContent({
//         model: "gemini-3-flash-preview",// its a model ID for Gemini 3 Flash.
//         contents:"explain how ai works in few word"
//     }); 
//     console.log(response.text)
// }
// main()


//!create conversations
const generateAssistantAnswer= async ({historyRows, question})=>{
    console.log('question:', question);
    console.log('historyRows:', historyRows)
    //format history
    const formattedHistory = historyRows.map(row=>({
        role: row.role === "assistant"? "model":"user",
        parts: [{text:row.content}]
    }))

    
    //for test
    
    console.log("history sent to gemini:");
    console.dir(formattedHistory, { depth: null });


    const chat = geminiClient.chats.create({
        model: GEMINI_MODEL,
        config:{
            maxOutputTokens:1024,//maxOutputTokens does not limit the tokens in history or your input... It only controls the generated output
            //Input tokens (history + user message)
            //         +
            // Output tokens (maxOutputTokens)
            //         =
            // Total tokens used
        },
        history: formattedHistory
    })
    console.log('Sending message to Gemini...')

    const result = await chat.sendMessage({message: question})

    console.log("Gemini response:", result.text);

    // console.log(result.text)
    return {
        text: result.text,
        totalTokens: result.usageMetadata?.totalTokenCount ?? 0 //nullish coalescing operator:If the value on the left is null or undefined, use 0
    }

}

//sample history format mihonew
// [
//     {
//         role: "user",
//         parts:[
//             {
//                 text: "hello"
//             }
//         ]
//     },
//     {
//         role: "user",
//         parts:[
//             {
//                 text: "hello"
//             }
//         ]
//     }
// ]



//*to frontend
const getMessageId = async (messageId) => {
    const [rows] = await db.execute(
        `SELECT id, role, content, token_count, created_at 
        FROM conversations
        WHERE id = ?
        LIMIT 1`,
        [messageId]
    );

    if(!rows[0]) return null;
    return{
        id: rows[0].id,
        role:rows[0].role,
        content: rows[0].content,
        tokenCount: Number(rows[0].token_count || 0),
        createdAt: rows[0].created_at
        
    }
}


export async function createConversationsService({question}) {
    try {
        //validation
        if(!question.trim()){
           let error=   new Error('question is required') 
           error.status = 400;
           throw error
        }

        //get recent conversations
        const historyRows = await getRecentConversationRows(5);

        //insert new user message/question
        let [result] = await db.execute(`INSERT INTO conversations(role, content) VALUES("user", ? )`, [question])

        //pass the qun and hisory for assistant and returns the assistantanswer and total-token
        const assistantAnswer = await generateAssistantAnswer({historyRows, question})

        //insert the assistanct answer to db
        const [createAssistantMessageResult] = await db.execute(
            `INSERT INTO conversations (role, content, token_count) VALUES(?, ?, ?)`, ["assistant", assistantAnswer.text, assistantAnswer.totalTokens]
        )

        //to frontend:get the new user convarsation id
        const userConversation = await getMessageId(result.insertId)
        //to frontend: get the new conversations id of assistant
        const assistantConversation = await getMessageId(createAssistantMessageResult.insertId)

        return { userConversation, assistantConversation }
        
    } catch (error) {
        throw error
    }
}