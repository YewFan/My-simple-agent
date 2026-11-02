import dotenv from 'dotenv' ;
import{build_agent_component, single_turn_tool_use} from './components.js'
import { load_tool_lib, read_tool_lib} from './tool_store.js';
import {tool_reg} from './tool.js'
import { select_tool } from './LLMAPI.js';
import {writeinagentfileSync} from './session_store.js';
import {write_in_history} from './context_manage.js'
dotenv.config();

//possibly one is that max count of circuitbreaker, one is that successfully get result.
async function main(){
//tool: load_tool_list
//input agent => 先尝试用单工具，单回合的任务
//call api
//save into history


function get_horoscope(sign:any) {
  return `${sign}: Next Tuesday you will befriend a baby otter.`;
}

function get_weather(locations: any, units: any){
  return `${locations}: 14 ${units} today.`
}

function search_attractions(city: any, category: any, limit: any){
    return `${city} is a good pick for ${category}; showing up to ${limit} attractions.`
}

function convert_currency(amount: any, from_currency: any, to_currency:any, result_amount: any){
    return `${amount} in ${from_currency} is ${result_amount} in ${to_currency}.`
}

const func_list: Record<string, (...args: any[]) => any> = {
  "get_horoscope": get_horoscope,
  "get_weather": get_weather,
  "search_attractions": search_attractions,
  "convert_currency": convert_currency
}

const input_list: Record<string, string> = {
  "get_horoscope": "get horoscope",
  "get_weather": "get weather",
  "search_attractions": "search attractions",
  "convert_currency": "convert currency"
} 

//initialize
let { initial_agent , initialResult, hist, agentfile } = await build_agent_component()

//from user's input to get a tool_list
let user_input = "我打算去东京玩两天，帮我看看东京天气，推荐2个热门景点，并帮我算一下500美元能换多少日元？"
initial_agent.message.user_message = user_input
let k = read_tool_lib()
const avail_tool_list = await select_tool(initial_agent, k) //need to change here, put it into schema factory 
//give this tool_list to tool_reg
let result: any[] = []
load_tool_lib()
let t = new tool_reg()
t.available_tool = avail_tool_list??[]
console.log("Available tools:", t.available_tool)
//loop the availablie tool list to get the result, //result into agent history
for(const item of t.available_tool){
  const tool = t.load_tool(item)
  const fn = func_list[item as keyof typeof func_list]
  const input = input_list[item as keyof typeof input_list]
  initial_agent.message.user_message = input
  await single_turn_tool_use(initial_agent, initialResult, fn, tool)
  result.push(initialResult.tool_response_message)
  
  write_in_history(initial_agent, hist, initialResult)

  initialResult.turn_number += 1
  initial_agent.message.turn_number += 1
  console.log(`Turn ${initialResult.turn_number}, ${initial_agent.message.turn_number}`)
  }
  writeinagentfileSync(hist, agentfile)
}

main()