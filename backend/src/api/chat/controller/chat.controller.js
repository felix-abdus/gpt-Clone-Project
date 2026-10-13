
import {createConversationsService, getRecentConversationRows} from "../service/chat.service.js"




async function createConversationController(req, res){
    try {
      
       let result = await createConversationsService(req.body)
        res.status(201).json(
            {
                success: true,
                message:"conversation posted successfully",
                data: result
            }
        )

    } catch (error) {
        console.log('error from post controller', error)
        throw error
        
    }
   
    
   
}


//==================================================


async function getConversationsController(req, res){
    try {
        const conversations = await getRecentConversationRows(10)
        return res.status(200).json({
            success: true,
            message: "conversations retrieved successfully",
            data: { conversations }
        })
    } catch (error) {
        console.log('error from get controller', error)
        throw error
    }
    
}

export {createConversationController, getConversationsController}