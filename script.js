// Cek apakah ada API Key tersimpan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('rfh_gemini_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
        // Opsional: Beri visual feedback bahwa key terload
        const inputField = document.getElementById('apiKey');
        inputField.style.borderColor = '#4ade80'; // Warna hijau
    }
});

async function generatePrompt() {
    // 1. Ambil API Key
    const apiKey = document.getElementById('apiKey').value.trim();
    
    // Validasi API Key
    if (!apiKey) {
        alert("⚠️ Mohon masukkan API Key Gemini Anda terlebih dahulu.");
        document.getElementById('apiKey').focus();
        return;
    }

    // FITUR BARU: Simpan API Key ke browser pengguna
    localStorage.setItem('rfh_gemini_api_key', apiKey);

    // 2. Ambil semua input user
    const inputs = {
        character: document.getElementById('charDesc').value || "Not specified",
        setting: document.getElementById('setting').value || "Not specified",
        action: document.getElementById('action').value || "Not specified",
        dialog: document.getElementById('dialog').value || "No dialog",
        style: document.getElementById('visualStyle').value,
        angle: document.getElementById('cameraAngle').value,
        move: document.getElementById('cameraMove').value,
        lighting: document.getElementById('lighting').value,
        ratio: document.getElementById('aspectRatio').value,
        mood: document.getElementById('mood').value,
    };

    // 3. Setup UI Loading State
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const output = document.getElementById('outputResult');
    
    // Ubah tombol jadi loading
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    btnText.innerText = "SEDANG MEMIKIRKAN PROMPT...";
    btnIcon.classList.remove('fa-robot');
    btnIcon.classList.add('fa-spinner', 'fa-spin');
    output.innerText = "Menghubungi satelit Gemini AI...";

    // 4. System Prompt (Sama seperti sebelumnya)
    const systemPrompt = `
        Role: Professional Video Prompt Engineer.
        Task: Convert user inputs into a highly detailed JSON format for AI Video Generation.
        
        USER INPUTS:
        - Character: ${inputs.character}
        - Setting: ${inputs.setting}
        - Action: ${inputs.action}
        - Dialog/Goal: ${inputs.dialog}
        - Visual Style: ${inputs.style}
        - Camera: ${inputs.angle}, ${inputs.move}
        - Lighting: ${inputs.lighting}
        - Mood: ${inputs.mood}
        - Aspect Ratio: ${inputs.ratio}

        INSTRUCTIONS:
        Create a JSON structure with keys: "project_title", "video_prompt_text", "audio_prompt", "technical_settings", "negative_prompt".
        Use English for the JSON values.
        OUTPUT MUST BE PURE VALID JSON.
    `;

    // 5. Eksekusi Call ke Gemini API
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        output.innerText = rawText;

    } catch (error) {
        console.error(error);
        output.innerText = "❌ Terjadi Kesalahan:\n" + error.message;
        // Jika errornya karena key salah, hapus dari storage
        if (error.message.includes('API key') || error.message.includes('403')) {
            localStorage.removeItem('rfh_gemini_api_key');
            alert("API Key tampaknya tidak valid atau kadaluarsa. Mohon masukkan ulang.");
        }
    } finally {
        // 6. Reset UI
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btnText.innerText = "GENERATE PROMPT JSON";
        btnIcon.classList.remove('fa-spinner', 'fa-spin');
        btnIcon.classList.add('fa-robot');
    }
}

function copyToClipboard() {
    const copyText = document.getElementById("outputResult").innerText;
    if (copyText.includes("Hasil prompt") || copyText.includes("Error")) return;
    navigator.clipboard.writeText(copyText).then(() => alert("✅ JSON berhasil disalin!"));
}
