import { json } from 'stream/consumers'
import {Agent} from './agent.js'
import {history, saving_format} from './context_manage.js'
import * as fs from 'fs'
import * as path from 'path'


//according to agent name, build the dir and create the file to store.
//require agent name, filepath
export interface agent_file {
    agent_dir: string,
    agent_num: number,
    max_agent_num: 50,
    if_write_in: boolean,
}

function fileexistSync(parentf: string, filename:string){
    const filename_json = filename + '.json'
    const targetfile = path.join(parentf, filename_json)
    if(fs.existsSync(targetfile)){
        return true
    }
    else{
        return false
    }
}

function folderexistSync(targetf: string) {
    if (!fs.existsSync(targetf)){
        return false;
    }
    const stats = fs.statSync(targetf)
    return stats.isDirectory()
}

function createfolder(targetf:string){
    if(folderexistSync(targetf) == true){
        console.log('the folder existed')
        return 
    }else{
        try{
            fs.mkdirSync(targetf)
            console.log("successfully created the folder")
        }catch(error){
            console.error("failed to create the folder")
        }
    }

}

function getfilenumberSync(k: agent_file) {
    try{
        const entries = fs.readdirSync(k.agent_dir, {withFileTypes: true})
        const fileentries = entries.filter((entry) => entry.isFile())
        k.agent_num = fileentries.length
    }catch(error){
        console.error('failed to retrieve the number of files')
        k.if_write_in = false
    }
}

function is_number_of_agent_max(k: agent_file){
    getfilenumberSync(k);
    if (k.agent_num >= k.max_agent_num){
        k.if_write_in = false
    }
    k.if_write_in = true
}


export function create_agentfileSync(k: agent_file, agent:Agent){
    createfolder(k.agent_dir)
    is_number_of_agent_max(k);
    if(k.if_write_in == false) {
        console.log(k.agent_num)
        throw Error("failed to write in")
    }
    if(agent.name === ''){
        const n = k.agent_num + 1
        agent.name = String(n)
    }
    if(fileexistSync(k.agent_dir, agent.name??'') == true){throw Error("the agent existed")}

    try{
        const agent_name_json = agent.name + '.json'
        const agentfilepath = path.join(k.agent_dir, agent_name_json)
        fs.writeFileSync(agentfilepath, '')
        console.log('successfully create the agent file')
    }catch(error){
        console.error('failed to create the agent file')
    }
}

//write in every turn
export function writeinagentfileSync(hist:history, k:agent_file){
    const agentfile_json = hist.agent_name + '.json'
    const agentfilepath = path.join(k.agent_dir, agentfile_json)
    const histjson = JSON.stringify(hist.arrayhist)
    try{
        fs.writeFileSync(agentfilepath, histjson, {encoding:'utf-8', flag: 'a'})
        console.log('writed in successfully')
        k.if_write_in = true
    }catch(error){
        console.error('failed to write in')
        k.if_write_in = false
    }
}

//input for the context
export function load_agent_file(k:agent_file, agent_name: string){
    const agent_filename = agent_name + '.json'
    const filepath = path.join(k.agent_dir, agent_filename)
    const data = fs.readFileSync(filepath,'utf-8')
    const data_format = JSON.parse(data) as saving_format[]
    return openai_input_format(data_format)
}


function openai_input_format(k: saving_format[]){
    let a : any[] = []
    for (const item of k){
        if(item.tool_name === ''){
            const message = {role: 'user', content: item.user_message}
            a.push(message)
            const result = {role: 'assistant', content: item.response_message}
            a.push(result)
        }
        if(item.tool_name !== ''){
            const message = {role: 'user', content: item.user_message}
            a.push(message)
            const tool_result = {type: 'function_call_output', call_id: item.tool_call_id, output: JSON.parse(item.tool_response_message??'')}
            a.push(tool_result)
        }
    }
    return a
}


