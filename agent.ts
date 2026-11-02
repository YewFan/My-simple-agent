import { llm, LLMAPI } from "./LLMAPI"
import {message} from "./context_manage"

export interface Agent {
    name: string,
    llm: llm, // define llm_name(instruct, inputs, tmp, max_token)
    llmparam: LLMAPI,
    message: message, // turn_num, user_message, instruction, tool_name?
    on_life_cycle?: boolean,
    total_token_num: number,
    enable_tool: boolean,

};

