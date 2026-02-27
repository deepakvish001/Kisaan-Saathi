# KrishiSahay 2.0 - Testing Guide

## Test Scenarios

### Scenario 1: Cotton Bollworm Detection

**Setup:**
1. Select Language: Hindi or English
2. Select Crop: Cotton (कपास)
3. Select Growth Stage: Boll Formation (गोला बनना)
4. Location: (Optional)

**User Input Examples:**
- English: "I see larvae on my cotton bolls"
- Hindi: "मेरे कपास के गोलों पर लार्वा दिख रहे हैं"
- Natural: "There are caterpillars eating the bolls"

**Expected Flow:**
1. System acknowledges: "I noticed: Larvae or caterpillars on bolls"
2. May ask: "What type of damage do you see on the bolls?"
3. Confidence builds as more symptoms described
4. Click "Get Recommendation" when button appears
5. Advisory shows: Cotton Bollworm diagnosis with treatment steps

**Expected Confidence:** High (80%+)

---

### Scenario 2: Cotton Whitefly Infestation

**Setup:**
1. Language: Hindi
2. Crop: Cotton (कपास)
3. Growth Stage: Vegetative Growth (वानस्पतिक वृद्धि)

**User Input Examples:**
- "सफेद कीड़े उड़ रहे हैं"
- "पत्तियां पीली हो रही हैं और मुड़ रही हैं"

**Expected Flow:**
1. System detects white insects symptom (primary indicator)
2. May ask about leaf yellowing and curling
3. Probability increases with each symptom
4. High confidence diagnosis

**Expected Result:** Cotton Whitefly with treatment recommendations

---

### Scenario 3: Wheat Rust Disease

**Setup:**
1. Language: English
2. Crop: Wheat
3. Growth Stage: Heading

**User Input Examples:**
- "Orange pustules on leaves"
- "Rust-colored spots appearing"
- "Brown-orange powder on wheat leaves"

**Expected Flow:**
1. System immediately recognizes rust symptoms
2. May ask: "Are the orange/rust pustules mostly on upper leaves, lower leaves, or throughout?"
3. Very high confidence due to distinct symptoms

**Expected Result:** Wheat Rust diagnosis with fungicide recommendations

---

### Scenario 4: Wheat Aphid Problem

**Setup:**
1. Language: Hindi
2. Crop: Wheat (गेहूं)
3. Growth Stage: Tillering (कल्ले फूटना)

**User Input Examples:**
- "पत्तियों पर हरे कीट हैं"
- "पौधे छोटे रह गए हैं"

**Expected Flow:**
1. Detects green insects (primary indicator for aphids)
2. May ask follow-up about stunted growth
3. Moderate to high confidence

**Expected Result:** Wheat Aphid with insecticide recommendations

---

### Scenario 5: Low Confidence Escalation

**Setup:**
1. Language: English
2. Crop: Cotton
3. Growth Stage: Any

**User Input Examples:**
- Vague symptoms: "Something is wrong with my crop"
- "The plants don't look healthy"
- Symptoms that match multiple diseases

**Expected Flow:**
1. System asks multiple clarifying questions
2. Tries to narrow down possibilities
3. If confidence remains < 60%, triggers escalation

**Expected Result:**
- Advisory generated but marked as "Low Confidence"
- Escalation warning appears
- Recommendation to contact Kisan Call Centre

---

## Voice Input Testing

**Browser Requirement:** Chrome/Edge (WebKit Speech Recognition)

**Steps:**
1. Click the microphone icon in chat input
2. Allow microphone permissions
3. Speak clearly in Hindi or English
4. System transcribes and processes

**Test Phrases:**
- English: "The leaves are turning yellow"
- Hindi: "पत्तियों पर भूरे धब्बे हैं"

---

## Text-to-Speech Testing

**Browser Requirement:** Any modern browser with Speech Synthesis

**Steps:**
1. Complete diagnosis flow
2. View advisory screen
3. Click speaker icon in top-right
4. System reads advisory aloud in selected language

---

## Language Switching

**Test:**
1. Start in English, complete diagnosis
2. Start new diagnosis
3. Switch to Hindi on landing page
4. Verify all UI elements translated
5. Verify responses in Hindi

---

## Mobile Responsiveness

**Test on:**
- Mobile phone (< 640px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

**Expected:**
- Touch-friendly buttons
- Readable text sizes
- Proper scrolling
- Voice input accessible

---

## Expected Advisory Format

```
🌾 Diagnosis: [Disease Name]

📊 Confidence Level: High/Moderate/Low (XX%)
[Confidence explanation]

📝 Description:
[Disease description in selected language]

💊 Treatment:
1. [Treatment step 1]
2. [Treatment step 2]
3. [Treatment step 3]
...

🛡️ Prevention:
[Prevention measures]

[⚠️ Escalation warning if confidence < 60%]

📋 Disclaimer
```

---

## Edge Cases to Test

### Empty Symptoms
- Send very vague messages
- Expect system to ask clarifying questions

### Multiple Symptoms
- Describe 3-4 symptoms in one message
- System should detect all

### Mixed Language Input
- Some users might mix Hindi and English
- Current version processes in selected language only

### Network Issues
- Slow network should show loading indicators
- Failed requests should show error messages

---

## Success Criteria

✅ Farmer can diagnose issue in < 5 interactions
✅ Confidence score is transparent and accurate
✅ Recommendations are actionable (specific products/dosages)
✅ Low confidence properly triggers escalation
✅ Voice input works for both languages
✅ Mobile experience is smooth
✅ Hindi text renders correctly
✅ System responds within 2-3 seconds

---

## Known Limitations (MVP)

- Only 2 crops supported (Cotton, Wheat)
- 6 disease profiles
- No image upload capability
- Basic symptom keyword matching
- No user accounts or history
- Limited to English and Hindi
- Voice recognition quality depends on browser

---

## Future Testing Areas

- Image-based symptom detection accuracy
- Vector similarity search for RAG
- Multi-turn conversation coherence
- Regional language variants
- Integration with weather APIs
- Performance under concurrent load
