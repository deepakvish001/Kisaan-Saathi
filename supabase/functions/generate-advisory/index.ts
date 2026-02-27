import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AdvisoryRequest {
  conversationId: string;
  language: string;
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

    const body: AdvisoryRequest = await req.json();
    const { conversationId, language } = body;

    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const probabilities = conversation.current_probabilities || {};

    if (Object.keys(probabilities).length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No diagnosis available yet. Please provide more information about symptoms.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const sortedDiseases = Object.entries(probabilities).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    );

    const [topDiseaseId, confidence] = sortedDiseases[0];

    const { data: disease } = await supabase
      .from('diseases')
      .select('*')
      .eq('id', topDiseaseId)
      .single();

    if (!disease) {
      throw new Error('Disease information not found');
    }

    const confidenceScore = confidence as number;
    const shouldEscalate = confidenceScore < 0.6;

    const diseaseName = language === 'hi' ? disease.name_hi : disease.name_en;
    const description = language === 'hi' ? disease.description_hi : disease.description_en;
    const treatment = language === 'hi' ? disease.treatment_hi : disease.treatment_en;
    const prevention = language === 'hi' ? disease.prevention_hi : disease.prevention_en;

    const treatmentSteps = treatment.split(/\d+\./).filter((s: string) => s.trim().length > 0);

    const actionSteps = treatmentSteps.map((step: string, index: number) => ({
      step: index + 1,
      action: step.trim(),
    }));

    let confidenceText = '';
    let confidenceLevelText = '';

    if (confidenceScore >= 0.8) {
      confidenceLevelText = language === 'hi' ? 'उच्च' : 'High';
      confidenceText = language === 'hi'
        ? 'मुझे इस निदान में बहुत विश्वास है।'
        : 'I am highly confident in this diagnosis.';
    } else if (confidenceScore >= 0.6) {
      confidenceLevelText = language === 'hi' ? 'मध्यम' : 'Moderate';
      confidenceText = language === 'hi'
        ? 'यह निदान संभावित है, लेकिन कृपया सावधानी से आगे बढ़ें।'
        : 'This diagnosis is likely, but please proceed with caution.';
    } else {
      confidenceLevelText = language === 'hi' ? 'कम' : 'Low';
      confidenceText = language === 'hi'
        ? 'मुझे इस निदान में पूरा विश्वास नहीं है।'
        : 'I am not fully confident in this diagnosis.';
    }

    let escalationText = '';
    if (shouldEscalate) {
      escalationText = language === 'hi'
        ? '\n\n⚠️ सिफारिश: कृपया किसी स्थानीय कृषि विशेषज्ञ या कृषि विज्ञान केंद्र से परामर्श लें। आप किसान कॉल सेंटर को 1800-180-1551 पर भी कॉल कर सकते हैं।'
        : '\n\n⚠️ Recommendation: Please consult a local agricultural expert or Krishi Vigyan Kendra. You can also call Kisan Call Centre at 1800-180-1551.';
    }

    const disclaimer = language === 'hi'
      ? '\n\n📋 अस्वीकरण: यह सलाह केवल सूचनात्मक उद्देश्यों के लिए है। किसी भी उपचार को लागू करने से पहले कृपया स्थानीय कृषि विशेषज्ञों से परामर्श लें।'
      : '\n\n📋 Disclaimer: This advisory is for informational purposes only. Please consult local agricultural experts before implementing any treatment.';

    const recommendationText = `
🌾 ${language === 'hi' ? 'निदान' : 'Diagnosis'}: ${diseaseName}

📊 ${language === 'hi' ? 'विश्वास स्तर' : 'Confidence Level'}: ${confidenceLevelText} (${(confidenceScore * 100).toFixed(0)}%)
${confidenceText}

📝 ${language === 'hi' ? 'विवरण' : 'Description'}:
${description}

💊 ${language === 'hi' ? 'उपचार' : 'Treatment'}:
${treatment}

🛡️ ${language === 'hi' ? 'रोकथाम' : 'Prevention'}:
${prevention}${escalationText}${disclaimer}
    `.trim();

    const { data: advisory } = await supabase
      .from('advisories')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        disease_id: topDiseaseId,
        confidence_score: confidenceScore,
        recommendation_text: recommendationText,
        language: language,
        action_steps: actionSteps,
        escalated: shouldEscalate,
      })
      .select()
      .single();

    await supabase
      .from('conversations')
      .update({
        status: shouldEscalate ? 'escalated' : 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return new Response(
      JSON.stringify({
        advisory: {
          id: advisory?.id,
          diseaseName,
          description,
          treatment,
          prevention,
          confidenceScore,
          confidenceLevel: confidenceLevelText,
          actionSteps,
          escalated: shouldEscalate,
          recommendationText,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating advisory:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
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
