import type {tool_format, tool_param, tool_property} from './tool.js'
import * as fs from 'fs'
import * as path from 'path'


export let tool_list = ["get_weather", "get_horoscope", "convert_currency", "search_attractions"]
export let tool_library: Map<string, tool_format<tool_param<tool_property>>>


//load_tool_lib
export function load_tool_lib() {
    const filepath = path.join('C:\\Users\\11239\\Desktop\\prj_as\\my_simple_agent', 'tool_lib.json')
    const tool_list = JSON.parse(fs.readFileSync(filepath, 'utf-8')) //[]
    tool_library = new Map()
    for(let i = 0; i < tool_list.length; i++){
        tool_library.set(tool_list[i].name, tool_list[i])
    }
    console.log(tool_library)
}

//save to tool_library
export function save_into_tool_lib(k: tool_format<tool_param<tool_property>>) {
    const filepath = path.join('C:\\Users\\11239\\Desktop\\prj_as\\my_simple_agent', 'tool_lib.json')
    let tool_list: tool_format<tool_param<tool_property>>[] = [];
    
    if (fs.existsSync(filepath)){
        try{
            const filedata = fs.readFileSync(filepath, 'utf-8');
            tool_list = JSON.parse(filedata)
        }catch(e){
            tool_list = [];
        }
    }

    const index = tool_list.findIndex((i) => i.name === k.name);
    if (index !== -1) {
        tool_list[index] = k
    } else{
        tool_list.push(k)
    }

    fs.writeFileSync(filepath, JSON.stringify(tool_list, null, 2), 'utf-8')
}


//read tool_library
export function read_tool_lib(){
    let k: any[] = []
    const filepath = path.join('C:\\Users\\11239\\Desktop\\prj_as\\my_simple_agent', 'tool_lib.json')
    const tool_list = JSON.parse(fs.readFileSync(filepath, 'utf-8')) 
    for (const item of tool_list){
        k.push(item)
    }
    return k
}


//get weather
const locations: tool_property = {
    type: "string",
    description: "City and country e.g. Bogotá, Colombia",
}

const units: tool_property = {
    type: "string",
    enum: ["celsius", "fahrenheit"],
    description: "Units the temperature will be returned in."
}
const weather_param: tool_param<tool_property> = {
    type: "object",
    properties:{locations, units},
    required: ["locations", "units"],
    additionalProperties: false,
}

const get_weather: tool_format<typeof weather_param> = {
    type: "function",
    name: "get_weather",
    description: "Retrieves current weather for the given location.",
    param: weather_param,
    strict: true,

}

//get_horoscope
const sign: tool_property = {
    type: "string",
    description: "An astrological sign like Taurus or Aquarius",
}

const horoscope_param: tool_param<tool_property> = {
    type:"object",
    properties: {sign},
    required: ["sign"],
    additionalProperties: false,
}

const get_horoscope: tool_format<typeof horoscope_param> = {
    type: "function",
    name: "get_horoscope",
    param: horoscope_param,
    description: "Get today's horoscope for an astrological sign.",
    strict: true,
}

//search_attractions
const city: tool_property = {
    type: "string",
    description: "目的地城市或地区名称，例如：'北京'、'东京'、'巴黎'",
}

const category: tool_property = {
    type: "string",
    description: "景点分类或偏好，例如：'自然风光'、'历史古迹'、'博物馆'、'主题乐园'",
    enum: ["自然风光", "历史古迹", "人文艺术", "主题乐园", "休闲逛街", "全部"]
}

const limit: tool_property = {
    type: "integer",
    description: "需要返回的景点数量上限，默认为 5",

}

const search_attractions_param: tool_param<tool_property> = {
    type: "object",
    properties: {city, category, limit},
    required: ["city", "category", "limit"],
    additionalProperties: false,
}

const search_attractions: tool_format<typeof search_attractions_param> = {
    type: "function",
    name: "search_attractions",
    param: search_attractions_param,
    description: "搜索指定城市或地区的热门旅游景点及相关推荐信息。",
    strict: true,
}

//convert_currency
const amount: tool_property = {
    type: "number",
    description: "需要换算的货币数额，例如:100",
}

const from_currency: tool_property = {
    type: "string",
    description: "源货币代码（建议使用标准 ISO 4217 格式），例如：'USD'、'CNY'、'JPY'",
}

const to_currency: tool_property = {
    type: "string",
    description: "目标货币代码（建议使用标准 ISO 4217 格式），例如：'CNY'、'EUR'、'HKD'",
}

const result_amount: tool_property = {
    type: "number",
    description: "换算后的货币数额, 例如:99.91"
}

const convert_currency_param: tool_param<tool_property> = {
    type: "object",
    properties: {amount, from_currency, to_currency, result_amount},
    required: ["amount", "from_currency", "to_currency", "result_amount"],
    additionalProperties: false,
}

const convert_currency: tool_format<typeof convert_currency_param> = {
    type: "function",
    name: "convert_currency",
    param: convert_currency_param,
    description: "实时计算并转换不同货币之间的汇率金额。",
    strict: true,
}

save_into_tool_lib(search_attractions)
save_into_tool_lib(convert_currency)