
import dotenv from 'dotenv';
dotenv.config();


const getopenairesponse = async (message) => {
    
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",

      "messages": [{
        "role": "user",
        "content":  message
      }]
    })
  };

  try {
       const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
       const data = await response.json();
       return data.choices[0].message.content || 'No response from model';

  } catch (error) {
    console.error(error);
    throw new Error('An error occurred');
  }


}
export{ getopenairesponse };