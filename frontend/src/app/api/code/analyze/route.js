// src/app/api/code/analyze/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, language, model = 'codegemma:7b', challenge } = body;
    
    if (!code || !challenge || !challenge.id) {
      return NextResponse.json(
        { error: "Code and challenge information are required" },
        { status: 400 }
      );
    }
    
    console.log(`[${new Date().toISOString()}] analyze request for challenge ${challenge.id} using model ${model}`);
    
    const systemPrompt = "You are an expert code analyzer. Provide a simple yes/no answer on code execution success.";
    const prompt = `${systemPrompt}\n\nAnalyze this ${language} solution for the following coding challenge:
      
Challenge: ${challenge.title}
Description: ${challenge.description}
${challenge.testCases ? `Test Cases: ${challenge.testCases}` : ''}

User's Solution:
\`\`\`${language}
${code}
\`\`\`

Reply with ONLY the following JSON format:
{
  "success": true/false,
  "message": "A one-sentence explanation of why the code succeeded or failed"
}
`;
    
    try {
      const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
          model: model,
          prompt: prompt,
          stream: false
      });
      
      console.log(`[${new Date().toISOString()}] analysis response received from Ollama`);
      
      // Parse JSON from Ollama response
      let parsedResult;
      try {
        // Extract JSON from the response (handling potential markdown formatting)
        const responseText = ollamaResponse.data.response;
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/{[\s\S]*}/);
                         
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        parsedResult = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Error parsing Ollama response:', parseError);
        // Fallback if parsing fails
        parsedResult = {
          success: false,
          message: "Unable to determine code execution status"
        };
      }
      
      return NextResponse.json({ 
          success: parsedResult.success,
          message: parsedResult.message,
          model: model,
          processingTime: ollamaResponse.data.total_duration
      });
    } catch (ollamaError) {
      console.error('Ollama API error:', ollamaError.message);
      return NextResponse.json(
        { 
          success: false,
          message: "Failed to connect to Ollama API. Make sure Ollama is running."
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in code analysis:', error);
    
    let errorMessage = "Unknown error occurred";
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}