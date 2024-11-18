
const thinkButton = document.getElementById('thinkButton');
// const originalButtonContent = thinkButton.innerHTML;
const lottieContainer = document.getElementById('lottieContainer');

async function processResponse(text, sessionId, systemMessage) {
    //generate next text
        // Make API call to process text
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "connect.sid=s%3AW0LEc5nSqLtrL2iax2pdw6bXq2weqtgv.lBDEnzMhkHVrua6UllUpt5cfyB%2BW2ZZfFwPE%2FF4AqqI");
    
        const raw = JSON.stringify({
            "session_id": sessionId,
            "user_text": text,
            "system_message": systemMessage
        });
    
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
    
        fetch("http://localhost:3000/api/audio/process-text", requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                const parsedResult = JSON.parse(result);
    
                handleToolCalls(parsedResult);
    
                // Check if there's audio data to play
                if (parsedResult.audio) {
                    const audioData = parsedResult.audio;
                    const audio = new Audio(`data:audio/wav;base64,${audioData}`);
                    
                    const lottieAnimation = lottie.loadAnimation({
                        container: lottieContainer,
                        renderer: 'svg',
                        loop: true,
                        autoplay: false,
                        path: '../assets/ai-response.json' // Path to your Lottie JSON file
                    });
                
                    // Show Lottie animation
                    lottieContainer.style.display = 'block';
                    lottieAnimation.play();

                    audio.play();
                    audio.onended = () => {
                        // Hide Lottie animation when audio ends
                        lottieContainer.style.display = 'none';
                        lottieAnimation.stop();
                    };
                    
                    // Display the transcript
                const transcript = parsedResult.transcript;
                console.log('Transcript:', transcript);
                document.getElementById('aiMessage').innerHTML = `<span class="tlt">${transcript}</span>`;

                $('.tlt').textillate({
                    in: {
                        delayScale: 1
                    }
                });

                // Revert button to original state
                thinkButton.innerHTML = originalButtonContent;
                }

                
            })
            .catch((error) => console.error(error));
}