import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with proper error handling
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is required. Please add it to your .env file.');
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const geminiService = {
  // Analyze image for cup detection and matcha quality
  async analyzeMatchaImage(imageBase64) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      // Remove data URL prefix to get just the base64 data
      const base64Data = imageBase64.split(',')[1];
      
      const prompt = `
        You are a matcha quality analyzer. Look at this image and determine:

        1. **CUP DETECTION** (Most Important): Is there any drinking vessel or container visible?
           Look for ANY of these: cup, mug, glass, bowl, container, vessel, coffee cup, tea cup, 
           drinking glass, ceramic cup, metal cup, plastic cup, paper cup, thermos, flask, 
           or any object that could hold liquid. Be VERY permissive - if you see anything 
           that could be used to hold a drink, mark it as detected.

        2. **MATCHA ANALYSIS** (Only if cup is detected):
           - Color: Describe the green color and intensity
           - Texture: Describe smoothness and consistency  
           - Froth: Describe any foam or bubbles
           - Overall: Overall visual quality assessment

        3. **RATING**: Rate from 0.0 to 5.0:
           - 0.0-1.0: Poor (dull, brownish, no froth)
           - 1.1-2.0: Below average (weak green, minimal froth)
           - 2.1-3.0: Average (moderate green, some froth)
           - 3.1-4.0: Good (vibrant green, good froth)
           - 4.1-5.0: Excellent (bright green, rich froth)

        IMPORTANT: Respond ONLY with valid JSON in this exact format:
        {
          "cupDetected": true/false,
          "rating": 0.0-5.0,
          "analysis": {
            "color": "description",
            "texture": "description", 
            "froth": "description",
            "overall": "description"
          },
          "confidence": 0.0-1.0,
          "recommendations": ["suggestion1", "suggestion2"]
        }

        If you see ANY container, vessel, or object that could hold liquid, set cupDetected to true.
        If no container is visible, set cupDetected to false and rating to 0.0.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('Raw Gemini response:', text);
      
      // Try to parse the JSON response
      let analysis;
      try {
        // Clean the response text to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        console.log('Response text was:', text);
        
        // Fallback: Try to detect cup from text response
        const textLower = text.toLowerCase();
        const cupKeywords = ['cup', 'mug', 'glass', 'bowl', 'container', 'vessel', 'drink', 'beverage', 'liquid'];
        const hasCupKeyword = cupKeywords.some(keyword => textLower.includes(keyword));
        
        // If we see cup-related keywords, assume cup is detected
        if (hasCupKeyword) {
          analysis = {
            cupDetected: true,
            rating: 3.0, // Default rating
            analysis: {
              color: "Green color detected",
              texture: "Appears to be liquid",
              froth: "May have some foam",
              overall: "Matcha-like beverage detected"
            },
            confidence: 0.7,
            recommendations: ["Try to get a clearer image for better analysis"]
          };
        } else {
          // No cup detected
          analysis = {
            cupDetected: false,
            rating: 0.0,
            analysis: {
              color: "No cup detected",
              texture: "No cup detected",
              froth: "No cup detected", 
              overall: "No drinking vessel visible"
            },
            confidence: 0.0,
            recommendations: ["Please position a cup or container in the frame"]
          };
        }
      }
      
      // Ensure all required fields are present
      if (!analysis.cupDetected && analysis.rating > 0) {
        analysis.rating = 0.0;
      }
      
      return analysis;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Ultimate fallback - assume cup is detected to avoid false negatives
      return {
        cupDetected: true,
        rating: 3.0,
        analysis: {
          color: "Analysis unavailable",
          texture: "Analysis unavailable", 
          froth: "Analysis unavailable",
          overall: "Analysis failed - please try again"
        },
        confidence: 0.5,
        recommendations: ["Please try again with a clearer image"]
      };
    }
  },

  // Enhanced analysis with more detailed feedback
  async getDetailedAnalysis(imageBase64, previousRating = null) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const base64Data = imageBase64.split(',')[1];
      
      const prompt = `
        Provide a comprehensive analysis of this matcha drink image. Focus on:

        1. **Visual Quality Assessment**:
           - Color vibrancy and authenticity of green
           - Consistency and smoothness
           - Presence and quality of froth/foam
           - Overall presentation

        2. **Matcha Characteristics**:
           - Grade indicators (ceremonial vs culinary)
           - Mixing quality
           - Water temperature indicators
           - Authenticity signs

        3. **Detailed Feedback**:
           - What's working well
           - Areas for improvement
           - Specific suggestions for better results

        4. **Professional Insights**:
           - Traditional matcha preparation standards
           - Common mistakes to avoid
           - Tips for achieving better results

        Respond in this JSON format:
        {
          "rating": 0.0-5.0,
          "detailedAnalysis": {
            "colorAnalysis": "detailed color assessment",
            "textureAnalysis": "detailed texture assessment", 
            "frothAnalysis": "detailed froth assessment",
            "overallQuality": "comprehensive quality assessment"
          },
          "improvementTips": ["tip1", "tip2", "tip3"],
          "gradeEstimate": "ceremonial/culinary/premium",
          "confidence": 0.0-1.0
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg", 
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return analysis;
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse detailed analysis:', parseError);
        return {
          rating: previousRating || 0.0,
          detailedAnalysis: {
            colorAnalysis: "Analysis unavailable",
            textureAnalysis: "Analysis unavailable",
            frothAnalysis: "Analysis unavailable", 
            overallQuality: "Analysis unavailable"
          },
          improvementTips: ["Try again with a clearer image"],
          gradeEstimate: "unknown",
          confidence: 0.0
        };
      }
    } catch (error) {
      console.error('Detailed analysis error:', error);
      throw new Error('Failed to get detailed analysis');
    }
  }
};

export default geminiService; 