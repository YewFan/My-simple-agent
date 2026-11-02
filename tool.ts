import {tool_list, tool_library, load_tool_lib, save_into_tool_lib} from './tool_store.js'


//later change param class and format class for create_new_tool: (remeber it is later. not now.)
export type tool_format <T>  = {
  type: string,
  name: string,
  description: string,
  param: T,
  strict: boolean,
}

export type tool_param <T> = {
  type: string,
  properties: Record<string, T>,
  required: string[], 
  additionalProperties: boolean,
}

export type tool_property = {
  type: string,
  description: string,
  enum?: string[],
}

//match openai first
export function schema_factory(format: tool_format<tool_param <tool_property>> ){
  const schema = {
    type: format.type,
    name: format.name,
    description: format.description,
    parameters: {
      type: format.param.type,
      properties: format.param.properties,
      required: format.param.required,
      additionalProperties: format.param.additionalProperties,
    },
    strict: format.strict,
  }
  return schema
}


//tool_reg
//from name to get instance of tool
//when use the instance from the reg, add a circuitbreaker attribute
export class tool_reg{
  public available_tool: typeof tool_list = tool_list;
  protected num_of_circuitbreaker: number = 0;
  readonly max_circuitbreaker: number = 3;

  public tool_add(name: string){
    for(let i = 0;i <this.available_tool.length; i++){
      if((name == this.available_tool[i])){
        console.log("this tool is already in the tool_list")
      }
    }
    this.available_tool.push(name)
    console.log("this tool has been added")
  }

  public tool_del(name:string){
    for(let i = 0;i <this.available_tool.length; i++){
      if((name == this.available_tool[i])){
        const newArray = this.available_tool.filter((_, k) => k !== i)
        this.available_tool = newArray
        return "this tool has been deleted"
      }
    }
    return "this tool is not in the tool_list"
  }

  public show_available_tool() {
    console.log(this.available_tool)
  }

  //use the instance from the name. change later when considering agent
  public load_tool(name: string){
    if (!(this.available_tool.includes(name))){
      throw Error ('this tool is not available.')
    }
    const tool = tool_library?.get(name)
    if (!tool) {
      throw Error ('this tool has not been defined.')
    } 
    return tool
  }

  // //create new instance in this function and save into the tool_store
  // public create_new_tool(prop_num: number, enable_to_use: boolean){
  //   //call writein fuction.
  //   let new_tool :tool_format<tool_param<any[]>> = write_in_type(prop_num)
  //   save_into_tool_lib(new_tool)
  //   if (enable_to_use == true) {
  //     this.available_tool.push(new_tool.name)
  //   } 
  // }

}


// class propbuilder{
//   private type: string = ''
//   private description: string = ''
//   private enum?: string[]

//   settype(type:string){
//     this.type =type
//     return this 
//   }

//   setdescription(desr:string){
//     this.description = desr
//     return this
//   }

//   setenum(e:string[]){
//     this.enum = e
//     return this
//   }

//   build(): tool_property{
//     return {type: this.type, description: this.description, 
//       ...(this.enum !== undefined && {enum: this.enum})
//     }
//   }
// }


// //prob on setting the number of properties into a param
// class parambuilder{
//   private type: string = ''
//   private properties: Record<string, tool_property> = {}
//   private required: string[] = []
//   private additionalProperties: boolean = false

//   settype(type:string) {
//     this.type = type
//     return this
//   }

//   setprop(key: string, configure: (builder: propbuilder) => void) {
//     const builder = new propbuilder()
//     configure(builder)
//     this.properties[key] = builder.build()

//     return this
//   }

//   setrequired(required: string[]) {
//     this.required = required
//     return this
//   }

//   setadditionalProperties(additionalProperties:boolean){
//     this.additionalProperties = additionalProperties
//     return this
//   }

//   build() {
//     return {
//       type: this.type,
//       properties: this.properties,
//       required: this.required,
//       additionalProperties: this.additionalProperties
//     }
//   }
// }


// class formatbuilder{
//   private type: string = ''
//   private name: string = ''
//   private description: string = ''
//   private parameter: ReturnType<parambuilder['build']> = {
//     type: '',
//     properties: {},
//     required: [],
//     additionalProperties: false,
//   }
//   private strict: boolean = false


//   settype(type: string){
//     this.type = type
//     return this
//   }
//   setname(name:string){
//     this.name = name
//     return this
//   }
//   setdesription(desription:string){
//     this.description = desription
//     return this
//   }
//   setparam(){
//     const builder = new parambuilder()
//     this.parameter = builder.build()
//     return this
//   }
//   setstrict(strict:boolean){
//     this.strict = strict
//     return this
//   }

//  build(){
//   return {
//     type: this.type,
//     name: this.name,
//     description: this.description,
//     parameter: this.parameter,
//     strict: this.strict
//   }
//  }
// }





