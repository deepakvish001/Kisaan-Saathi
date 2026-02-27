import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalyzeRequest {
  imageId: string;
  imageUrl: string;
  cropType?: string;
  language?: string;
}

interface SymptomDetection {
  symptom: string;
  confidence: number;
  location: string;
  severity: string;
}

interface AnalysisResult {
  detectedSymptoms: SymptomDetection[];
  overallCondition: string;
  urgency: string;
  visualDescription: string;
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader || '' },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body: AnalyzeRequest = await req.json();
    const { imageId, imageUrl, cropType, language = 'en' } = body;

    if (!imageId || !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing imageId or imageUrl' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const analysisResult = await analyzeImageWithAI(
      imageUrl,
      cropType,
      language,
      openaiApiKey
    );

    await supabase
      .from('crop_images')
      .update({
        analysis_results: analysisResult,
      })
      .eq('id', imageId);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error analyzing crop image:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze image',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function analyzeImageWithAI(
  imageUrl: string,
  cropType: string | undefined,
  language: string,
  apiKey: string
): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert agricultural pathologist and crop disease specialist. Analyze the provided crop image and identify any visible diseases, pests, nutritional deficiencies, or health issues.

Provide your analysis in the following JSON format:
{
  "detectedSymptoms": [
    {
      "symptom": "Name of symptom (e.g., Leaf spot, Yellowing, Wilting)",
      "confidence": 0.0-1.0,
      "location": "Where on plant (e.g., Lower leaves, Upper stem)",
      "severity": "mild|moderate|severe"
    }
  ],
  "overallCondition": "healthy|stressed|diseased|critical",
  "urgency": "low|medium|high|critical",
  "visualDescription": "Detailed description of what you see in the image",
  "recommendations": ["List of immediate actions farmer should take"]
}

Be specific and practical. Focus on actionable insights.`;

  const userPrompt = cropType
    ? `Analyze this ${cropType} crop image for diseases, pests, and health issues.`
    : 'Analyze this crop image for diseases, pests, and health issues.';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);

    return analysis;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      detectedSymptoms: [],
      overallCondition: 'unknown',
      urgency: 'medium',
      visualDescription: 'Unable to analyze image automatically. Please describe what you see.',
      recommendations: ['Manual analysis required'],
    };
  }
}
