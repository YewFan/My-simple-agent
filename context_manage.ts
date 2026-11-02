import {Agent} from "./agent.js"
import * as fs from 'fs'
import * as path from 'path'

//save the chat history as a context builder for the agent.
//1. receive the response into the history
//2. checking history if exceed the limit


//message: one time send-message
 export type message = {
    turn_number: number,
    user_message: string,
    instruction?: string,
    tool_name?: string,
}

//result_message: one time result-message
export type result_message ={      
    agent_name: string,      
    turn_number: number,
    if_api_work: boolean,
    response_message: string,
    tool_response_message?: string,
    tool_call_id?: string,
    output_token_number: number,
    input_token_number: number,
}


//json? every api schema is different. build the common, change when use api
export interface history {
    agent_name: string,
    turn_number: number,
    arrayhist: any[],
}

//format for saving into history interface
export interface saving_format {
    turn_num: number,
    user_message: string,
    instruction?: string,
    tool_name?: string,
    response_message: string,
    tool_response_message?: string,
    tool_call_id?: string,
    input_token_number: number,
    output_token_number: number,
}


// save message into one agent's history. 
export function write_in_history(Agent: Agent, hist: history, result: result_message) {

    hist.turn_number = Agent.message.turn_number 
    if (!(Agent.name == hist.agent_name)) {
        throw new Error("matching the wrong agent history")
    }
    if (!(Agent.name == result.agent_name)){
        throw new Error("matching the wrong agent result")
    }
    if (!(Agent.message.turn_number == result.turn_number)){
        throw new Error("matching the wrong agent turn result")
    }
    let save: saving_format = {
        turn_num: hist.turn_number,
        user_message: Agent.message.user_message,
        instruction: Agent.message.instruction ??'',
        tool_name: Agent.message.tool_name ?? '',
        response_message: result.response_message,
        tool_response_message: result.tool_response_message ??'',
        tool_call_id: result.tool_call_id,
        input_token_number: result.input_token_number,
        output_token_number: result.output_token_number
    }
    console.log(save)
    hist.arrayhist.push(save)
    console.log(hist.arrayhist)

}


// provide history & check token_num & check_length_of_resp
// keep recent 50 turn responses
export function truncate_history(agent: Agent, currentpath:string) {
    const agentfilepath = agent.name + '.json'
    const targetfile = path.join(currentpath, agentfilepath)
    if (agent.total_token_num >= 32000 && agent.message.turn_number > 50) {
        if(!(fs.existsSync(targetfile))){
            throw new Error("the agent file does not exist!")
        }
        const result = fs.readFileSync(targetfile, 'utf-8')
        const arr: string[] = JSON.parse(result)
        const truncation = arr.slice(-50)
        fs.writeFileSync(targetfile, JSON.stringify(truncation), 'utf-8') //cover the original file
    }else{
        console.log("not reach the limit, no need for truncation.")
    }
}



//summary