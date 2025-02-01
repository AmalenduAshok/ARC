require('dotenv').config();


document.addEventListener('DOMContentLoaded', function() {

    // Handle Take Quiz Button
    const takeQuizBtn = document.querySelector('#takeQuizBtn');
    takeQuizBtn.addEventListener('click', function() {
        startQuiz();
    });

    // Function to start the quiz
    function startQuiz() {
        // Hide the home section content
        const heroSection = document.querySelector('.hero');
        heroSection.style.display = 'none';

        // Create a container for the quiz
        const quizContainer = document.createElement('div');
        quizContainer.classList.add('quiz-container');
        document.body.appendChild(quizContainer);

        const quizTitle = document.createElement('h2');
        quizTitle.textContent = "Mental Health Quiz";
        quizContainer.appendChild(quizTitle);

        // Questions array
        const questions = [
            {
                question: "How often do you feel stressed or anxious?",
                options: ["Rarely", "Sometimes", "Often", "Always"]
            },
            {
                question: "How would you rate your sleep quality?",
                options: ["Very Poor", "Poor", "Good", "Excellent"]
            },
            {
                question: "Do you often feel overwhelmed by daily tasks?",
                options: ["Never", "Occasionally", "Frequently", "Always"]
            },
            {
                question: "How often do you engage in relaxing activities?",
                options: ["Never", "Sometimes", "Often", "Always"]
            },
            {
                question: "How would you rate your overall mental health?",
                options: ["Very Poor", "Poor", "Good", "Excellent"]
            }
        ];

        // Dynamically create questions and answer choices
        questions.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question');

            const questionText = document.createElement('p');
            questionText.textContent = q.question;
            questionElement.appendChild(questionText);

            q.options.forEach(option => {
                const optionLabel = document.createElement('label');
                optionLabel.textContent = option;
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question-${index}`;
                optionInput.value = option;
                optionLabel.appendChild(optionInput);
                questionElement.appendChild(optionLabel);
            });

            quizContainer.appendChild(questionElement);
        });

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "Submit Quiz";
        quizContainer.appendChild(submitBtn);

        submitBtn.addEventListener('click', function() {
            evaluateQuiz(questions);
        });
    }

    // Function to evaluate quiz results
    function evaluateQuiz(questions) {
        const quizContainer = document.querySelector('.quiz-container');
        const answers = [];

        // Collect user responses
        questions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption) {
                answers.push(selectedOption.value);
            } else {
                answers.push("No answer");
            }
        });

        // Evaluate the mental health status based on the answers
        let score = 0;
        answers.forEach(answer => {
            switch (answer) {
                case "Always":
                case "Very Poor":
                    score += 1;
                    break;
                case "Often":
                case "Poor":
                    score += 2;
                    break;
                case "Sometimes":
                case "Good":
                    score += 3;
                    break;
                case "Rarely":
                case "Excellent":
                    score += 4;
                    break;
                default:
                    score += 0;
            }
        });

        // Display the result
        const result = document.createElement('div');
        result.classList.add('quiz-result');

        if (score <= 6) {
            result.textContent = "It seems like you're facing some mental health challenges. Consider seeking professional support.";
        } else if (score <= 12) {
            result.textContent = "You may be experiencing moderate stress. Take some time for self-care and relaxation.";
        } else {
            result.textContent = "You're doing great! Keep up your good mental health practices!";
        }

        quizContainer.innerHTML = '';  // Clear quiz questions
        quizContainer.appendChild(result);  // Show the result
    }

    // Chatbot Functionality
    const openAiKey = process.env.API_KEY; // Replace with your OpenAI API Key

    async function sendMessageToOpenAI(userMessage) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // Use GPT-4 model
                    messages: [
                        {
                            role: "user",
                            content: `Act like you are a mental health therapist${userMessage}`
                        }
                    ],
                    max_tokens: 150,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("OpenAI API Error:", errorData);
                throw new Error(`API Error: ${errorData.error.message}`);
            }
    
            const data = await response.json();
            const aiMessage = data.choices[0].message.content.trim(); // Extract the message content
            return aiMessage;
        } catch (error) {
            console.error("Error interacting with OpenAI:", error);
            return "Sorry, I couldn't process your message. Please try again.";
        }
    }

    // Handle Chatbot User Input
    const chatContainer = document.querySelector('#chat');
    const userInputButton = document.querySelector('#user-input-button');
    userInputButton.addEventListener('click', async function() {
        const userMessage = document.querySelector('#user-input').value;

        if (userMessage) {
            // Display the user's message
            const userMessageElement = document.createElement('div');
            userMessageElement.textContent = `You: ${userMessage}`;
            chatContainer.appendChild(userMessageElement);

            // Get response from OpenAI and display
            const aiMessage = await sendMessageToOpenAI(userMessage);
            const aiMessageElement = document.createElement('div');
            aiMessageElement.textContent = `AI: ${aiMessage}`;
            chatContainer.appendChild(aiMessageElement);

            // Clear input field
            document.querySelector('#user-input').value = '';
        }
    });

});
