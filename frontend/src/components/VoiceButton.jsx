import { useEffect, useRef, useState } from "react";

export default function VoiceButton({ onText }) {
  const [active, setActive] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = e => {
        const txt = e.results[0][0].transcript;
        onText?.(txt);
      };
      rec.onend = () => setActive(false);
      recRef.current = rec;
    }
  }, [onText]);

  function toggle() {
    if (!recRef.current) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    if (active) {
      recRef.current.stop();
    } else {
      recRef.current.start();
    }
    setActive(!active);
  }

  return (
    <button type="button" onClick={toggle}>
      {active ? "Listening..." : "🎙️ Voice"}
    </button>
  );
}
