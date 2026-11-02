//agent config
// 配置是config: Config.py:
// 配置项按功能分组：
// 1. LLM 默认参数：模型、提供商、温度、最大 Token 数。
// 3. 上下文与摘要：窗口大小、压缩阈值、保留轮数、智能摘要及摘要模型参数。
// 4. 工具输出：最大行数/字节数、输出目录和截断方向。
// 5. 可观测性：Trace 开关、目录、脱敏及 HTML 原始响应设置。
// 6. Skills：启用状态、技能目录及自动注册。
// 8. 会话：持久化开关、目录和自动保存频率。


//慢慢更新
export const config = {
    llm_name: 'gpt-6-astra', //api relevant
    llm_provider: 'gpt',
    temp: 1,
    max_token: 1024,
    contextwindowsize: 32000, //context relevant
    keep_num_turns: 50,
    using_tool: false,
    max_agent_number: 50,
    if_write_in: true,
}