# My Simple Agent

My Simple Agent is a lightweight AI agent framework designed to combine tool use, memory, model API integration, and runtime orchestration in a compact and understandable structure.

Although the project is still under active development, its core architecture is already in place and provides a solid foundation for building and extending agent-based workflows.

## Project Overview

The project is organized into four core layers:

### 1. Tool Layer
- Files: `tool.ts`, `tool_store.ts`, `tool_lib.json`
- Provides a centralized tool registry for the agent.
- Exposes available tools through a structured lookup mechanism, allowing the agent to discover and invoke capabilities efficiently.

### 2. Memory Layer
- Files: `context_manage.ts`, `session_store.ts`
- Manages contextual information and session state across agent execution loops.
- Helps preserve conversation history and runtime state for each agent instance.

### 3. API Integration Layer
- File: `LLMAPI.ts`
- Connects the agent to multiple large language model providers.
- Supports chat-based interaction with GPT, Claude, and Gemini, while using GPT for tool-calling workflows.

### 4. Runtime Layer
- Files: `simple_agent.ts`, `components.ts`
- Contains the main execution logic of the application.
- `simple_agent.ts` coordinates the agent workflow, while `components.ts` initializes runtime parameters and prepares the environment before execution begins.

## Key Objectives

- Build a simple yet extensible agent runtime
- Support tool registration, discovery, and execution
- Maintain session-aware memory and context
- Integrate with multiple LLM providers
- Keep the architecture easy to read, modify, and extend

## Current Status

The foundational framework is largely complete, and the project continues to evolve as more features, optimizations, and integrations are added.

## License

This project is licensed under the MIT License. See the [LICENSE](C:/Users/11239/Desktop/prj_as/my_simple_agent/LICENSE) file for details.