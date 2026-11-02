import {OpenAI} from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv' ;
import {result_message}  from './context_manage.js';
import {Agent} from './agent.js';
import { toResponseInputItems } from "openai/lib/responses/ResponseInputItems";
import { tool_format, tool_param, tool_property, schema_factory } from './tool.js';

dotenv.config();

// tool api: gpt, claude, gemini
// later change into ssE event type 
// later 定义客户端生命周期, 流式调用和工具调用接口
// could use prompt caching to save tokens

export type llm = 'gpt'|'claude'|'gemini'

export interface LLMAPI{
    LLM_model_name: string;
    LLM_API_KEY?: string;
    LLM_TEMP: number;
    LLM_MAX_TOKEN: number;
}

export function createLLMAPI(
    LLM_model_name: string,
    LLM_TEMP =  1,
    LLM_MAX_TOKEN =  1024
): LLMAPI {
    const LLM_API_KEY = {
        gemini: process.env.GEMINI_API_KEY,
        claude: process.env.ANTHROPIC_API_KEY,
        gpt: process.env.OPENAI_API_KEY
    } [LLM_model_name];
    if (!LLM_API_KEY) {
    throw new Error("lack api key");
    }
    return {LLM_model_name, LLM_API_KEY, LLM_TEMP, LLM_MAX_TOKEN}
}

//single-turn chat
//gemini(single chat) 
export async function use_gemini(agent: Agent, result: result_message){
    const model_name = agent.llmparam.LLM_model_name 
    const tmp = agent.llmparam.LLM_TEMP
    const max_token = agent.llmparam.LLM_MAX_TOKEN
    let new_call = createLLMAPI('gemini', tmp, max_token);
    const ai = new GoogleGenAI({apiKey: new_call.LLM_API_KEY})
      const response = await ai.models.generateContent({
        model: model_name,
        contents: agent.message.user_message, 
        config:{
            systemInstruction: agent.message.instruction,
            maxOutputTokens: new_call.LLM_MAX_TOKEN,
            temperature: new_call.LLM_TEMP,
        },}
    );
    result.response_message = response.text ?? "null"
    result.output_token_number = (response.usageMetadata?.candidatesTokenCount ?? 0) + (response.usageMetadata?.thoughtsTokenCount ?? 0)
    result.input_token_number = response.usageMetadata?.promptTokenCount ?? 0
    if(result.response_message == "null" || result.output_token_number == 0){
        result.if_api_work = false
    }else{
        result.if_api_work = true
    }
    return result
}

//claude(single chat) default: assistant
export async function use_claude(agent: Agent, result: result_message){
    const model_name = agent.llmparam.LLM_model_name 
    const tmp = agent.llmparam.LLM_TEMP
    const max_token = agent.llmparam.LLM_MAX_TOKEN
    let new_call = createLLMAPI('claude', tmp, max_token);
    type instruct = "user" | "assistant" | "system"
    let ins: instruct  = "assistant"
    if (agent.message.instruction == "user"){
        ins = "user"
    }else if(agent.message.instruction == "system"){
        ins = "system"
    }else{
        ins = "assistant"
    }

    const ai = new Anthropic({ apiKey: new_call.LLM_API_KEY });
    const message = await ai.messages.create({
        max_tokens: new_call.LLM_MAX_TOKEN,
        temperature: new_call.LLM_TEMP,
        messages: [{ role: ins, content: agent.message.user_message }], 
        model: model_name
    })
    let result1 = ''
    for (const block of message.content){
        if (block.type == "text"){
            result1 += block.text
        }
    }
    result.response_message = (result1 !== '') ? result1 : "null"
    result.input_token_number = message.usage.input_tokens
    result.output_token_number = message.usage.output_tokens
    if(result.response_message == "null" || result.output_token_number == 0){
        result.if_api_work = false
    }else{
        result.if_api_work = true
    }
    return result;
}

//gpt(single chat) 
export async function use_gpt(agent: Agent, result: result_message){
    const model_name = agent.llmparam.LLM_model_name 
    const tmp = agent.llmparam.LLM_TEMP
    const max_token = agent.llmparam.LLM_MAX_TOKEN
    let new_call = createLLMAPI('gpt', tmp, max_token);
    const ai = new OpenAI ({apiKey: new_call.LLM_API_KEY})
    const response = await ai.responses.create({
        model: model_name,
        instructions: agent.message.instruction,
        input: agent.message.user_message,
        max_output_tokens: new_call.LLM_MAX_TOKEN,
        temperature: new_call.LLM_TEMP
    })
    result.response_message = response.output_text ?? "null"
    result.input_token_number = response.usage?.input_tokens ?? 0
    result.output_token_number = response.usage?.output_tokens ?? 0
    if(result.response_message == "null" || result.output_token_number == 0){
        result.if_api_work = false
    }else{
        result.if_api_work = true
    }
    return result
}

export type LLMCALLING = {
    gpt: typeof use_gpt,
    claude: typeof use_claude,
    gemini: typeof use_gemini
}


export type input_format = {
    role: "user" | "assistant" | "system" | "function_call_output",
    content?: string,
    type?: "function_call_output",
    call_id?: string,
    output?: any
}

//openai_tool_call
export async function openaitoolapi(input: any[], tool_func: Function, tool: tool_format<tool_param<tool_property>>, model_name:string, instruction_key: string){
    let tools: any[] = []
    tools.push(schema_factory(tool))
    const invokeTool = (argumentsJson: string) => {
        const parsed: Record<string, any> = JSON.parse(argumentsJson)
        const args = tool.param.required.map(key => parsed[key])
        return tool_func(...args)
    }

        // const parsed: Record<string, any> = JSON.parse(item.arguments);
        // const args = tool.param.required.map(key => parsed[key])
        // const weather = (tool_func as any)(...args);
    

    let new_call = createLLMAPI('gpt')
    const ai = new OpenAI({apiKey: new_call.LLM_API_KEY})
    let response = await ai.responses.create({
        model: model_name,
        tools,
        input,
        });
    input.push(...toResponseInputItems(response.output));
    
    for (const item of response.output) {
      if (item.type !== "function_call") continue;
    
      if (item.name === tool.name) {
        const toolResult = invokeTool(item.arguments)
    
        input.push({
          type: "function_call_output",
          call_id: item.call_id,
          output: toolResult,
        });
      }
    }

    response = await ai.responses.create({
            model: model_name,
            instructions: `Respond only with toolResults generated by a tool`,
            tools,
            input,
            });
    for(const item of response.output){
        if (item.type !== "function_call") continue;

        if (item.name === tool.name){
            return { result: invokeTool(item.arguments), responseId: response.id }
        }
    }
    return "api failed"
}


//type for fine-tuning of tool select
type step = {
    explanation: string,
    tool_name: string,
}

type tool_list = {
    steps: step[],
    final_tool_list: string[]
}



//fine-tuning for tool_list output
//the input of tool_list is the schema of tool
export async function select_tool(agent: Agent, tool_list: any[]){
    const k = createLLMAPI('gpt')
    const b = new OpenAI({apiKey: k.LLM_API_KEY})
    const response = await b.responses.parse({
        model: agent.llmparam.LLM_model_name,
        instructions: "the name of the selected tool must be the same as the given tool list. All the outputs should be English.",
        input:[
                {
                    role: "system",
                    content: `You are a helpful planner. solving user's problems through using tools step by step. Given a list of tools ${JSON.stringify(tool_list, null, 2)}, select tools and return a order of tools in an array form.`,
                },
                { role: "user",
                 content: agent.message.user_message },
                ],
        text: {
            format: {
                    "type": "json_schema",
                    "name": "tool_selecting",
                    "strict": true,
                    "schema": {
                        "type": "object",
                        "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                            "type": "object",
                            "properties": {
                                "explanation": { "type": "string" },
                                "tool_name": { "type": "string" }
                            },
                            "required": ["explanation", "tool_name"],
                            "additionalProperties": false,
                            },
                        },
                        "final_tool_list": { "type": "array", "items": {"type": "string"} },
                        },
                        "required": ["steps", "final_tool_list"],
                        "additionalProperties": false,
                    },
                    },
        },
    })

    console.log(response.output_parsed)
    const J = (response.output_parsed as tool_list | null)?.final_tool_list
    if (!Array.isArray(J)) return
    return J

}