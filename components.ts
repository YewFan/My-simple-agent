import {config} from './config.js'
import {Agent} from './agent.js'
import {tool_format, tool_param, tool_property, tool_reg} from './tool.js'
import {message, result_message, history} from './context_manage.js'
import { LLMCALLING, llm, LLMAPI, use_claude, use_gemini, use_gpt, openaitoolapi, input_format } from './LLMAPI.js'
import { load_tool_lib } from './tool_store.js'
import { agent_file, create_agentfileSync } from './session_store.js'
//Components:   定义历史管理器、Token 计数器、截断器、会话存储和技能加载器需要提供的最小方法集合. 与agent的调用关系：core/agent.py 的 Agent.__init__() 调用 build_agent_components(config, llm.model, components)，随后把解析后的
//history_manager、token_counter、truncator、session_store、skill_loader 保存到 Agent 的公开属性。


export async function build_agent_component(agent_name?: string, using_toolname?: string) {

    //agent
    const initialMessage: message = {
        turn_number: 0,
        user_message: '',
        instruction: '',
    }
    const initialResult: result_message = {
        agent_name: '',
        turn_number: 0,
        if_api_work: false,
        response_message: '',
        output_token_number: 0,
        input_token_number: 0,
    }

    const initial_llmparam: LLMAPI = {
        LLM_model_name: config.llm_name,
        LLM_TEMP: config.temp,
        LLM_MAX_TOKEN: config.max_token
    }

    //file 
    const agentfile: agent_file = {
        agent_dir: 'C:\\Users\\11239\\Desktop\\prj_as\\my_simple_agent\\agentfile',
        agent_num: 0,
        max_agent_num: config.max_agent_number as 50,
        if_write_in: config.if_write_in
    }

    let initialllm: llm = 'gpt'
    if (config.llm_provider == 'gpt') {initialllm = 'gpt' }
    if (config.llm_provider == 'claude') {initialllm = 'claude' }
    if (config.llm_provider == 'gemini') {initialllm = 'gemini' }

    let initial_agent: Agent = {
        name: '',
        llm: initialllm,
        message: initialMessage,
        total_token_num: 0,
        enable_tool: false,
        llmparam:initial_llmparam
    }
    
    if (agent_name !== undefined) {
        initial_agent.name = agent_name ?? ''

    }
    
    if (using_toolname !== undefined)  {
        initial_agent.message.tool_name = using_toolname,
        initial_agent.enable_tool = true
    }

    create_agentfileSync(agentfile, initial_agent)

    const hist: history = {
    agent_name: initial_agent.name ?? '',
    turn_number: 0,
    arrayhist: []
    }

    initialResult.agent_name = initial_agent.name ?? ''
    
    //tool_reg 
    let tool: any
    if (initial_agent.enable_tool == true){
        load_tool_lib()
        let k = new tool_reg()
        k.tool_add(initial_agent.message.tool_name??'')
        tool = k.load_tool(initial_agent.message.tool_name??'')
    }

    if (tool !== undefined){
        return {initial_agent, initialResult, tool, hist, agentfile}
    }
    return {initial_agent, initialResult, hist, agentfile}
}

    
async function single_turn_llm_chat(initial_agent:Agent, initialResult:result_message){
    const llmcalling : LLMCALLING = {
        gpt: use_gpt,
        claude: use_claude,
        gemini: use_gemini
    }

    if (initial_agent.llm == 'gpt'){
        await llmcalling.gpt(initial_agent, initialResult)
    }
    else if (initial_agent.llm == 'claude'){
        await llmcalling.claude(initial_agent, initialResult)
    }
    else if (initial_agent.llm == 'gemini'){
        await llmcalling.gemini(initial_agent, initialResult)
    }
    else{
        throw Error("please the fill name of llm")
    }
    
}
    

    
//need to know whether it is first turn or not later
export async function single_turn_tool_use(initial_agent:Agent, initial_Result:result_message, func: Function, tool: tool_format<tool_param<tool_property>>){
    let input: any[] = []
    const message: input_format = {
        role: "user",
        content: initial_agent.message.user_message
    }
    input.push(message)
    const key = await openaitoolapi(input, func, tool, initial_agent.llmparam.LLM_model_name, initial_agent.message.tool_name??'')
    if( key === "api failed"){
        initial_Result.if_api_work = false,
        initial_Result.response_message = key
    }else{
        initial_Result.tool_call_id = key.responseId
        initial_Result.tool_response_message = key.result
        console.log(initial_Result.tool_response_message)
    }

}